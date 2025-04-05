"use client"

import { CameraView } from "expo-camera"
import { router } from "expo-router"
import * as Location from "expo-location"
import * as ExpoDevice from "expo-device"
import {
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  View,
  PermissionsAndroid,
} from "react-native"
import { Overlay } from "../../../components/Overlay"
import { useEffect, useRef, useState } from "react"
import { SolidButtonArrowLeft } from "@/components/CustomButtons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { BleManager, type Device } from "react-native-ble-plx"

const Scanner = () => {
  const qrLock = useRef(false)
  const appState = useRef(AppState.currentState)
  const [scannedAddress, setScannedAddress] = useState<string | null>(null)
  const [deviceStatus, setDeviceStatus] = useState<string>("Waiting for scan...")
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const bleManagerRef = useRef<BleManager | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isScanning, setIsScanning] = useState(false)

  // Request permissions for both Android and iOS
  const requestPermissions = async () => {
    if (Platform.OS === "ios") {
      // For iOS, we need to request location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
      if (locationStatus !== "granted") {
        Alert.alert("Permissions Required", "Bluetooth scanning requires location permissions")
        return false
      }
      return true
    } else if (Platform.OS === "android") {
      try {
        // For Android, we need different permissions based on the Android version
        if (ExpoDevice.platformApiLevel && ExpoDevice.platformApiLevel < 31) {
          // Android 11 (API 30) and below
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: "Location Permission Required",
            message: "Bluetooth scanning requires location permission",
            buttonPositive: "Grant Permission",
          })

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permissions Required", "Bluetooth scanning requires location permissions")
            return false
          }
        } else {
          // Android 12 (API 31) and above
          const bluetoothScanGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
            title: "Bluetooth Scan Permission",
            message: "App needs Bluetooth Scan permission",
            buttonPositive: "Grant Permission",
          })

          const bluetoothConnectGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: "Bluetooth Connect Permission",
              message: "App needs Bluetooth Connect permission",
              buttonPositive: "Grant Permission",
            },
          )

          const locationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "App needs Location permission for Bluetooth scanning",
              buttonPositive: "Grant Permission",
            },
          )

          if (
            bluetoothScanGranted !== PermissionsAndroid.RESULTS.GRANTED ||
            bluetoothConnectGranted !== PermissionsAndroid.RESULTS.GRANTED ||
            locationGranted !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert("Permissions Required", "All permissions are required for Bluetooth functionality")
            return false
          }
        }
        return true
      } catch (err) {
        console.error("Permission request error:", err)
        return false
      }
    }
    return true
  }

  // Initialize BLE manager
  useEffect(() => {
    let mounted = true

    const initializeBLE = async () => {
      try {
        // Check permissions first
        const hasPermissions = await requestPermissions()
        if (!hasPermissions) {
          setDeviceStatus("Missing required permissions")
          setIsInitializing(false)
          return
        }

        // Create a new BLE manager instance
        if (!bleManagerRef.current) {
          bleManagerRef.current = new BleManager()
          console.log("BLE Manager created")
        }

        // Check if Bluetooth is powered on
        const state = await bleManagerRef.current.state()
        console.log("Bluetooth state:", state)

        if (state !== "PoweredOn") {
          Alert.alert("Bluetooth is not enabled", "Please enable Bluetooth to connect to your device", [
            {
              text: "OK",
              onPress: () => {
                // On Android, we can try to enable Bluetooth programmatically
                if (Platform.OS === "android") {
                  bleManagerRef.current
                    ?.enable()
                    .then(() => console.log("Bluetooth enabled successfully"))
                    .catch((error) => console.error("Failed to enable Bluetooth:", error))
                }
              },
            },
          ])
        }

        if (mounted) {
          setIsInitializing(false)
          console.log("BLE Manager initialized successfully")
        }
      } catch (error) {
        console.error("Failed to initialize BLE Manager:", error)
        if (mounted) {
          setIsInitializing(false)
          setDeviceStatus(`BLE initialization error: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    initializeBLE()

    // Clean up function
    return () => {
      mounted = false
      // Clean up BLE manager when component unmounts
      if (bleManagerRef.current) {
        try {
          if (connectedDevice) {
            bleManagerRef.current
              .cancelDeviceConnection(connectedDevice.id)
              .catch((err) => console.log("Error disconnecting:", err))
          }
          bleManagerRef.current.destroy()
          console.log("BLE Manager destroyed successfully")
        } catch (error) {
          console.error("Error during BLE cleanup:", error)
        }
      }
    }
  }, []) // Empty dependency array

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false

        // Re-initialize BLE manager if coming back to foreground
        if (bleManagerRef.current === null) {
          bleManagerRef.current = new BleManager()
          console.log("BLE Manager re-created after app state change")
        }
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Connect to Bluetooth device
  const connectToDevice = async (macAddress: string) => {
    if (isInitializing) {
      setDeviceStatus("BLE Manager is initializing, please wait...")
      return
    }

    if (!bleManagerRef.current) {
      console.error("BLE Manager is not initialized")
      setDeviceStatus("BLE Manager is not initialized, trying to reinitialize...")

      // Try to reinitialize
      bleManagerRef.current = new BleManager()
      await new Promise((resolve) => setTimeout(resolve, 500)) // Give it a moment to initialize

      if (!bleManagerRef.current) {
        setDeviceStatus("Failed to initialize BLE Manager")
        return
      }
    }

    try {
      // Stop any existing scan first
      if (isScanning && bleManagerRef.current) {
        bleManagerRef.current.stopDeviceScan()
        setIsScanning(false)
      }

      setDeviceStatus(`Searching for device: ${macAddress}...`)
      setIsScanning(true)

      // Start scanning for devices
      bleManagerRef.current.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
        if (error) {
          console.error("Scan error:", error)
          setDeviceStatus(`Error scanning: ${error.message}`)
          setIsScanning(false)
          if (bleManagerRef.current) {
            bleManagerRef.current.stopDeviceScan()
          }
          return
        }

        console.log("Found device:", device?.id, device?.name)

        // For Android, we can directly match by MAC address
        if (Platform.OS === "android" && device?.id.toUpperCase() === macAddress.toUpperCase()) {
          handleDeviceFound(device)
        }
        // For iOS, we need to match by other characteristics as iOS doesn't expose MAC addresses
        else if (Platform.OS === "ios" && device) {
          // You might need to match by name or other characteristics
          // This is a simplified example - you may need to adjust based on your device
          if (device.name && device.name.includes("YourDeviceNamePrefix")) {
            handleDeviceFound(device)
          }
        }
      })

      // Stop scanning after 30 seconds if no device found
      setTimeout(() => {
        if (!connectedDevice && bleManagerRef.current && isScanning) {
          try {
            bleManagerRef.current.stopDeviceScan()
            setIsScanning(false)
            setDeviceStatus("Device not found after timeout. Try scanning again.")
          } catch (error) {
            console.error("Error stopping scan:", error)
          }
        }
      }, 30000)
    } catch (error) {
      console.error("BLE connection error:", error)
      setIsScanning(false)
      setDeviceStatus(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeviceFound = (device: Device) => {
    if (!bleManagerRef.current) {
      console.error("BLE Manager is not initialized in handleDeviceFound")
      return
    }

    try {
      bleManagerRef.current.stopDeviceScan()
      setIsScanning(false)
      setDeviceStatus(`Device found: ${device.name || device.id}. Connecting...`)

      // Connect to the device
      bleManagerRef.current
        .connectToDevice(device.id, { autoConnect: true, timeout: 10000 })
        .then((connectedDevice) => {
          setConnectedDevice(connectedDevice)
          setDeviceStatus(`Connected to: ${connectedDevice.name || connectedDevice.id}`)
          return connectedDevice.discoverAllServicesAndCharacteristics()
        })
        .then((device) => {
          console.log("Device connected and ready:", device.id)
          // Here you can start interacting with the device
          // List all services and characteristics to help debug
          return device.services().then((services) => {
            services.forEach((service) => {
              console.log("Service:", service.uuid)
              service.characteristics().then((characteristics) => {
                characteristics.forEach((characteristic) => {
                  console.log(
                    "  Characteristic:",
                    characteristic.uuid,
                    "Properties:",
                    characteristic.isReadable ? "Read " : "",
                    characteristic.isWritableWithResponse ? "Write " : "",
                    characteristic.isWritableWithoutResponse ? "WriteWithoutResponse " : "",
                    characteristic.isNotifiable ? "Notify " : "",
                  )
                })
              })
            })
          })
        })
        .catch((error) => {
          console.error("Connection error:", error)
          setDeviceStatus(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`)
        })
    } catch (error) {
      console.error("Error in handleDeviceFound:", error)
      setDeviceStatus(`Error handling device: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Add this function before the connectToDevice function:
  const normalizeMacAddress = (macAddress: string): string => {
    const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, "")
    // Format as XX:XX:XX:XX:XX:XX
    if (cleanMac.length === 12) {
      return cleanMac.match(/.{1,2}/g)?.join(":") || macAddress
    }
    return macAddress
  }

  // Handle QR code scanning
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true
      console.log("QR Code scanned, raw data:", data)
      console.log("QR Code scanned, MAC address:", data)
      // const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/
      if (!macAddressRegex.test(data)) {
        setDeviceStatus("Invalid MAC address format in QR code")
        setTimeout(() => {
          qrLock.current = false
        }, 3000)
        return
      }

      setScannedAddress(data)
      connectToDevice(normalizeMacAddress(data))
    }
  }

  // Manual reconnect function
  const handleReconnect = () => {
    if (scannedAddress) {
      qrLock.current = false
      connectToDevice(scannedAddress)
    } else {
      setDeviceStatus("No device address available. Please scan a QR code first.")
    }
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "ios" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        zoom={0}
        ratio="16:9"
        onBarcodeScanned={handleBarcodeScanned}
      />
      <Overlay />

      {/* Status display */}
      <Animated.View
        className="absolute w-full top-20 bg-black p-4 rounded-lg"
        entering={FadeInDown.duration(300).delay(200).springify()}
      >
        {isInitializing ? (
          <View className="flex-row items-center justify-center space-x-2">
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-white text-center font-bold text-lg">Initializing BLE Manager...</Text>
          </View>
        ) : (
          <>
            <Text className="text-white text-center font-bold text-lg">{deviceStatus}</Text>
            {isScanning && (
              <View className="flex-row items-center justify-center space-x-2 mt-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-center">Scanning...</Text>
              </View>
            )}
          </>
        )}
        {scannedAddress && <Text className="text-white text-center mt-2">MAC: {scannedAddress}</Text>}

        {/* Reconnect button */}
        {scannedAddress && !isInitializing && !isScanning && !connectedDevice && (
          <View className="mt-4">
            <Text className="text-white text-center bg-blue-600 p-2 rounded-lg" onPress={handleReconnect}>
              Retry Connection
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View
        className="w-[85%] pt-6 flex justify-center m-auto bottom-8"
        entering={FadeInDown.duration(300).delay(200).springify()}
      >
        <SolidButtonArrowLeft
          text="Back"
          onPress={() => {
            // Disconnect from device before going back
            if (connectedDevice && bleManagerRef.current) {
              try {
                bleManagerRef.current
                  .cancelDeviceConnection(connectedDevice.id)
                  .catch((err) => console.log("Error disconnecting on back:", err))
              } catch (error) {
                console.error("Error disconnecting on back button:", error)
              }
            }
            router.back()
          }}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

export default Scanner

