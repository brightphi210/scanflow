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
  ScrollView,
} from "react-native"
import { Overlay } from "../../../components/Overlay"
import { useEffect, useRef, useState } from "react"
import { SolidButtonArrowLeft, SolidButtonGreenArrowLeft } from "@/components/CustomButtons"
import Animated, { FadeInDown } from "react-native-reanimated"
import RNBluetoothClassic, { type BluetoothDevice } from "react-native-bluetooth-classic"
import { Dialog } from "react-native-ui-lib"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import ReceiptDialog from "./receipt-dialog"

interface ReceiptItem {
  name: string
  price: string
  quantity: string
}

interface ReceiptData {
  employee: string
  pos: string
  items: ReceiptItem[]
  total: string
  paymentMethod: string
  paymentAmount: string
  dateTime: string
  receiptNumber: string
}

const Scanner = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false) // State for tracking data loading
  const [cameraActive, setCameraActive] = useState(true) // New state to control camera visibility

  const qrLock = useRef(false)
  const appState = useRef(AppState.currentState)
  const [scannedAddress, setScannedAddress] = useState<string | null>(null)
  const [deviceStatus, setDeviceStatus] = useState<string>("Waiting for scan...")
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([])
  const [connectionInterval, setConnectionInterval] = useState<NodeJS.Timeout | null>(null)
  const [dataSubscription, setDataSubscription] = useState<any>(null)
  const [fullDataBuffer, setFullDataBuffer] = useState<string[]>([])
  const isReceivingData = useRef(false)
  const dataTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [receiptData, setReceiptData] = useState<ReceiptData>({
    employee: "Unknown",
    pos: "",
    items: [],
    total: "#0.00",
    paymentMethod: "Cash",
    paymentAmount: "#0.00",
    dateTime: new Date().toLocaleString(),
    receiptNumber: "0-0000",
  })

  const CONNECTION_CHECK_INTERVAL = 5000
  const DATA_LOADING_TIMEOUT = 2000

  const requestPermissions = async () => {
    if (Platform.OS === "ios") {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
      console.log("iOS Location Permission Status:", locationStatus)
      if (locationStatus !== "granted") {
        Alert.alert("Permissions Required", "Bluetooth scanning requires location permissions")
        return false
      }
      return true
    } else if (Platform.OS === "android") {
      try {
        if (ExpoDevice.platformApiLevel && ExpoDevice.platformApiLevel < 31) {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: "Location Permission Required",
            message: "Bluetooth scanning requires location permission",
            buttonPositive: "Grant Permission",
          })
          console.log("Android < 31 Location Permission:", granted)
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permissions Required", "Bluetooth scanning requires location permissions")
            return false
          }
        } else {
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
          console.log("Android 31+ Bluetooth Connect Permission:", bluetoothConnectGranted)
          console.log("Android 31+ Location Permission:", locationGranted)

          if (
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
        console.log(`Permission request error: ${err instanceof Error ? err.message : String(err)}`)
        return false
      }
    }
    return true
  }

  useEffect(() => {
    let mounted = true

    const initializeBluetooth = async () => {
      try {
        const hasPermissions = await requestPermissions()
        if (!hasPermissions) {
          if (mounted) {
            setDeviceStatus("Missing required permissions")
            setIsInitializing(false)
          }
          return
        }

        try {
          const isEnabled = await RNBluetoothClassic.isBluetoothEnabled()
          console.log("Bluetooth Enabled:", isEnabled)

          if (!isEnabled) {
            Alert.alert("Bluetooth is not enabled", "Please enable Bluetooth to connect to your device", [
              {
                text: "OK",
                onPress: async () => {
                  if (Platform.OS === "android") {
                    try {
                      await RNBluetoothClassic.requestBluetoothEnabled()
                      console.log("Bluetooth enabled successfully")
                    } catch (error) {
                      console.error("Failed to enable Bluetooth:", error)
                      if (mounted) {
                        setDeviceStatus(
                          `Failed to enable Bluetooth: ${error instanceof Error ? error.message : String(error)}`,
                        )
                        setIsInitializing(false)
                      }
                    }
                  }
                },
              },
            ])
            if (mounted) {
              setIsInitializing(false)
            }
            return
          }
        } catch (bluetoothError) {
          console.error("Error checking Bluetooth status:", bluetoothError)
          if (mounted) {
            console.log(
              `Error checking Bluetooth status: ${bluetoothError instanceof Error ? bluetoothError.message : String(bluetoothError)}`,
            )
            setIsInitializing(false)
          }
          return
        }

        try {
          const devices = await RNBluetoothClassic.getBondedDevices()
          console.log("Paired Devices found:", devices.length)
          if (mounted) {
            setPairedDevices(devices)
          }
        } catch (error) {
          console.error("Failed to get paired devices:", error)
          if (mounted) {
            console.log(`Error getting paired devices: ${error instanceof Error ? error.message : String(error)}`)
          }
        }

        if (mounted) {
          setIsInitializing(false)
        }
      } catch (error) {
        console.error("Failed to initialize Bluetooth Classic:", error)
        if (mounted) {
          setIsInitializing(false)
          console.error(`Bluetooth initialization error: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    initializeBluetooth()

    const disconnectListener = RNBluetoothClassic.onDeviceDisconnected((event) => {
      console.log("Device disconnected:", event)
      if (connectedDevice && event.device && event.device.address === connectedDevice.address) {
        console.log("Device disconnected unexpectedly")
        setConnectedDevice(null)
        cleanupDataSubscription()
        if (connectionInterval) {
          clearInterval(connectionInterval)
          setConnectionInterval(null)
        }
      }
    })

    return () => {
      mounted = false
      cleanupDataSubscription()
      disconnectListener.remove()
      disconnectFromDevice()
      if (connectionInterval) {
        clearInterval(connectionInterval)
      }
      // Clear data timeout if component unmounts
      if (dataTimeoutRef.current) {
        clearTimeout(dataTimeoutRef.current)
      }
    }
  }, [])

  const formatPrinterData = (raw: any) => {
    if (!raw) return ""

    // Step 1: Remove all printer control codes and unwanted characters
    const formatted = raw
      .replace(/1b\s+[@!dt][0-9]*/g, "") // Remove ESC commands
      .replace(/1d\s+[A-Za-z0-9]+/g, "") // Remove GS commands
      .replace(/[a-z]\s+[a-z]/g, " ") // Replace single letter patterns with space
      .replace(/-{2,}/g, "") // Remove repeated dashes
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
      .replace(/VB[0-9]*/g, "") // Remove VB codes
      .trim()

    console.log("Cleaned formatted data:", formatted)

    // Better regex patterns with improved POS extraction
    const employeeMatch = formatted.match(/Employee:\s*([A-Za-z0-9]+)/)
    // Specifically look for POS pattern and capture everything until the next section
    const posMatch = formatted.match(/POS:\s*(POS\s*[0-9]+)/i)

    // For product extraction, use a more specific regex
    const productPattern = /([A-Za-z\s]+?)(?=\s+#[\d,]+\.\d+)\s+(#[\d,]+\.\d+)\s+(\d+\s+x\s+#[\d,]+\.\d+)/g
    const products = []
    let match

    while ((match = productPattern.exec(formatted)) !== null) {
      products.push({
        name: match[1].trim(),
        price: match[2].trim(),
        quantity: match[3].trim(),
      })
    }

    // Extract total and payment with more specific patterns
    const totalMatch = formatted.match(/Total\s+(#[\d,]+\.\d+)/)
    const cashMatch = formatted.match(/Cash\s+(#[\d,]+\.\d+)/)
    const dateMatch = formatted.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[ap]m)\s+#(\d+-\d+)/)

    // Create a structured receipt object
    const receipt: ReceiptData = {
      employee: employeeMatch?.[1] || "Unknown",
      pos: posMatch?.[1]?.trim() || "", // Default to POS 1 if not found
      items: products,
      total: totalMatch?.[1] || "#0.00",
      paymentMethod: "Cash",
      paymentAmount: cashMatch?.[1] || "#0.00",
      dateTime: dateMatch?.[1] || new Date().toLocaleString(),
      receiptNumber: dateMatch?.[2] || "0-0000",
    }

    console.log("📃 FORMATTED RECEIPT DATA:", receipt)
    setReceiptData(receipt)

    // Return a string version for display in the debug view
    let result = ""

    result += `Employee: ${receipt.employee}\n`
    if (receipt.pos) {
      result += `POS: ${receipt.pos}\n`
    }

    if (receipt.items.length > 0) {
      receipt.items.forEach((product) => {
        result += `${product.name} ${product.price}\n`
        result += `${product.quantity}\n`
      })
    }

    result += `Total ${receipt.total}\n`
    result += `Cash ${receipt.paymentAmount}\n`
    result += `${receipt.dateTime} #${receipt.receiptNumber}`

    return result
  }

  // Reset the data timeout each time we receive new data
  const resetDataTimeout = () => {
    // Clear any existing timeout
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
    }

    // Set a new timeout
    dataTimeoutRef.current = setTimeout(() => {
      // If we still have data and we're in loading state, consider data reception complete
      if (fullDataBuffer.length > 0 && isDataLoading) {
        console.log("📊 Data reception timeout - assuming data is complete")
        setIsDataLoading(false)

        // Process and display the data
        const completeData = fullDataBuffer.join(" ")
        const formatted = formatPrinterData(completeData)
        console.log("📊 COMPLETE RAW DATA:", completeData)

        // Now show the success dialog
        setIsOpen(true)
      }
    }, DATA_LOADING_TIMEOUT)
  }

  // Modified useEffect to handle data loading state
  useEffect(() => {
    if (fullDataBuffer.length > 0) {
      // We have data, set loading to true and reset the timeout
      setIsDataLoading(true)
      setCameraActive(false) // Turn off camera when loading data
      resetDataTimeout()

      // Process data but don't show dialog yet
      const completeData = fullDataBuffer.join(" ")
      const formatted = formatPrinterData(completeData)
    }
  }, [fullDataBuffer])

  const cleanupDataSubscription = () => {
    if (dataSubscription) {
      console.log("Removing existing data subscription")
      dataSubscription.remove()
      setDataSubscription(null)
    }
    isReceivingData.current = false

    // Also clear any data timeout
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
      dataTimeoutRef.current = null
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false
        RNBluetoothClassic.isBluetoothEnabled()
          .then((isEnabled) => {
            if (!isEnabled) {
              setDeviceStatus("Bluetooth is disabled. Please enable Bluetooth.")
            }
          })
          .catch((error) => console.error("Error checking Bluetooth status:", error))
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const startReadingFromDevice = async (device: BluetoothDevice) => {
    if (!device) return

    try {
      // Clear previous data buffer
      setFullDataBuffer([])
      isReceivingData.current = true
      setIsDataLoading(true) // Set loading state to true when we start reading
      setCameraActive(false) // Disable camera when starting to read data
      qrLock.current = true // Lock QR scanning when data is being received

      console.log(`👂 Setting up data listener for device: ${device.name || device.address}`)

      cleanupDataSubscription()

      // Create new subscription
      const subscription = device.onDataReceived((data) => {
        console.log("Raw data buffer:", data.data)

        if (data && data.data) {
          const receivedStr = data.data.trim()
          setFullDataBuffer((prev) => [...prev, receivedStr])

          // Reset the data timeout since we received new data
          resetDataTimeout()

          try {
            const jsonObj = JSON.parse(receivedStr)
            console.log(`📊 Parsed JSON:`, jsonObj)
          } catch (e) {
            // Not JSON, which is fine
          }
        } else {
          console.log("⚠️ Received data object is empty or undefined.")
        }
      })

      setDataSubscription(subscription)
      console.log("✅ Data listener established successfully")
    } catch (error) {
      console.error("❌ Error setting up data listener:", error)
      console.log(`Error setting up data listener: ${error instanceof Error ? error.message : String(error)}`)
      isReceivingData.current = false // Reset flag on error
      setIsDataLoading(false) // Also reset loading state on error
      qrLock.current = false // Unlock QR scanning if there's an error
    }
  }

  const startConnectionCheckInterval = (device: BluetoothDevice) => {
    if (connectionInterval) {
      clearInterval(connectionInterval)
    }

    const intervalId = setInterval(async () => {
      if (device && device.address) {
        try {
          const isConnected = await device.isConnected()
          if (!isConnected) {
            setDeviceStatus("Device disconnected (periodic check)")
            setConnectedDevice(null)
            cleanupDataSubscription()
            clearInterval(intervalId)
            setConnectionInterval(null)
            setIsDataLoading(false) // Reset loading state if device disconnects
            qrLock.current = false // Unlock QR scanning if device disconnects
          }
        } catch (error) {
          console.error("Error checking connection status:", error)
          console.log(`Error checking connection status: ${error instanceof Error ? error.message : String(error)}`)
          setDeviceStatus(`Error checking connection: ${error instanceof Error ? error.message : String(error)}`)
          setConnectedDevice(null)
          cleanupDataSubscription()
          clearInterval(intervalId)
          setConnectionInterval(null)
          setIsDataLoading(false) // Reset loading state on error
          qrLock.current = false // Unlock QR scanning on error
        }
      } else {
        clearInterval(intervalId)
        setConnectionInterval(null)
      }
    }, CONNECTION_CHECK_INTERVAL)

    setConnectionInterval(intervalId)
  }

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        cleanupDataSubscription()
        await connectedDevice.disconnect()
        setDeviceStatus("Disconnected from device")
        setConnectedDevice(null)
        setIsDataLoading(false) // Reset loading state on disconnect
        qrLock.current = false // Unlock QR scanning on disconnect
        if (connectionInterval) {
          clearInterval(connectionInterval)
          setConnectionInterval(null)
        }
      } catch (error) {
        console.error("Error during disconnect:", error)
      }
    }
  }

  const connectToDevice = async (macAddress: string) => {
    if (isInitializing) {
      setDeviceStatus("Bluetooth is initializing, please wait...")
      return
    }

    try {
      // Make sure we're disconnected first
      if (connectedDevice) {
        await disconnectFromDevice()
      }

      setDeviceStatus(`Searching for device: ${macAddress}...`)
      setIsScanning(true)

      // Find the device in paired devices list
      const targetDevice = pairedDevices.find((device) => device.address.toUpperCase() === macAddress.toUpperCase())

      if (!targetDevice) {
        setDeviceStatus(
          `Device with address ${macAddress} is not paired. Please pair the device in your Bluetooth settings first.`,
        )
        setIsScanning(false)
        qrLock.current = false // Unlock QR scanning if device not found
        return
      }

      setDeviceStatus(`Device found: ${targetDevice.name || targetDevice.address}. Connecting...`)

      // Connect to the device
      const device = await RNBluetoothClassic.connectToDevice(targetDevice.address, {
        delimiter: "",
        charset: "utf-8",
      })

      // Update state
      setConnectedDevice(device)
      setIsScanning(false)
      setDeviceStatus(`Connected to: ${device.name || device.address}`)

      // Clear old data
      setFullDataBuffer([])
      setIsDataLoading(false) // Reset loading state before starting new data read

      // Start reading data after successful connection
      await startReadingFromDevice(device)
      startConnectionCheckInterval(device)
    } catch (error) {
      console.error("❌ Bluetooth connection error:", error)
      setIsScanning(false)
      console.log(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
      setDeviceStatus(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
      setConnectedDevice(null)
      cleanupDataSubscription()
      setIsDataLoading(false) // Reset loading state on error
      qrLock.current = false // Unlock QR scanning on error
      if (connectionInterval) {
        clearInterval(connectionInterval)
        setConnectionInterval(null)
      }
    }
  }

  const normalizeMacAddress = (macAddress: string): string => {
    const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, "")
    if (cleanMac.length === 12) {
      return cleanMac.match(/.{1,2}/g)?.join(":") || macAddress
    }
    return macAddress
  }

  const handleBarcodeScanned = ({ data }: any) => {
    if (data && !qrLock.current) {
      qrLock.current = true
      console.log("QR Code scanned, MAC address:", data)
      const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/
      if (!macAddressRegex.test(data)) {
        setDeviceStatus("Invalid MAC address format in QR code")
        setTimeout(() => {
          qrLock.current = false
        }, 3000)
        return
      }

      // Reset the QR lock after a delay to allow for new scans
      setTimeout(() => {
        qrLock.current = false
        console.log("🔓 QR lock reset - ready for next scan")
      }, 5000)

      setScannedAddress(data)
      connectToDevice(normalizeMacAddress(data))
    }
  }

  const handleViewReceipt = () => {
    setIsOpen(false)
    setShowReceiptDialog(true)
  }

  // New function to handle rescanning
  const handleRescan = () => {
    // Close the receipt dialog
    setShowReceiptDialog(false)

    // Reset states to enable scanning again
    setCameraActive(true)
    qrLock.current = false
    setScannedAddress(null)
    setFullDataBuffer([])

    console.log("🔄 Rescan initiated - camera activated")
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "ios" ? <StatusBar hidden /> : null}

      {/* Only render CameraView when camera is active */}
      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          zoom={0}
          ratio="16:9"
          onBarcodeScanned={qrLock.current ? undefined : handleBarcodeScanned}
        />
      )}

      {/* Render a dark background when camera is not active */}
      {!cameraActive && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.9)" }]} />}

      <Overlay />

      {/* Centered loading indicator when data is being received */}
      {isDataLoading && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={{ color: "#00ff00", marginTop: 16, fontWeight: "bold" }} className="text-lg">
            Receiving data from device...
          </Text>
          <Text
            className="w-[70%] text-xs"
            style={{ color: "#ffffff", marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}
          >
            Please keep your device connected and wait while we process the receipt data
          </Text>
        </View>
      )}

      <Animated.View
        className="absolute w-full top-16 bg-black/90 p-3 rounded-lg mx-2"
        entering={FadeInDown.duration(300).delay(200).springify()}
        style={{ maxHeight: "60%", width: "100%", alignSelf: "center" }}
      >
        <ScrollView>
          {isInitializing ? (
            <View className="flex-row items-center justify-center space-x-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white text-center font-bold text-sm">Initializing Bluetooth...</Text>
            </View>
          ) : (
            <>
              {isScanning && (
                <View className="flex-row items-center justify-center space-x-2 mt-2">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white text-center">Connecting...</Text>
                </View>
              )}
            </>
          )}

          <View>
            <Text className="text-white text-center text-sm mt-2">Scanflow</Text>
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View
        className="w-[85%] pt-6 flex justify-center m-auto bottom-8"
        entering={FadeInDown.duration(300).delay(200).springify()}
      >
        <SolidButtonArrowLeft
          text="Back"
          onPress={() => {
            disconnectFromDevice()
            router.back()
          }}
        />
      </Animated.View>

      {/* Success dialog - now doesn't show when data is loading */}
      <Dialog
        visible={isOpen && !isDataLoading}
        onDismiss={() => {
          ""
        }}
      >
        <View>
          <View className="p-5 py-10 bg-neutral-900 border border-neutral-700 rounded-xl">
            <View className="bg-green-200 w-fit justify-center flex items-center m-auto rounded-full p-4">
              <MaterialIcons name="check" size={50} color={"green"} />
            </View>
            <View>
              <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-lg text-center pt-5 text-white">
                Receipt Successfully Generated 🎉
              </Text>
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-xs w-[90%] m-auto text-center pt-3 text-neutral-300"
              >
                Your receipt has been successfully generated, you can now view it in the history tab.
              </Text>
            </View>

            <View className="w-[70%] mt-5 m-auto">
              <SolidButtonGreenArrowLeft text="View Receipt" onPress={handleViewReceipt} />
            </View>
          </View>
        </View>
      </Dialog>

      {/* Receipt Dialog - now passing the rescan handler */}
      <ReceiptDialog
        visible={showReceiptDialog}
        onDismiss={() => setShowReceiptDialog(false)}
        receiptData={receiptData}
      />
    </SafeAreaView>
  )
}

export default Scanner
