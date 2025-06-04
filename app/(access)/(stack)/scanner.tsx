"use client"

import { CameraView } from "expo-camera"
import { router } from "expo-router"
import * as Location from "expo-location"
import * as ExpoDevice from "expo-device"
import * as Haptics from "expo-haptics" // Add this import
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
import { useEffect, useRef, useState, useCallback } from "react"
import { SolidButtonArrowLeft } from "@/components/CustomButtons"
import Animated, { FadeInDown } from "react-native-reanimated"
import RNBluetoothClassic, { type BluetoothDevice } from "react-native-bluetooth-classic"
import ReceiptDialog from "./receipt-dialog"
import { useFocusEffect } from "expo-router"

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

// Default empty receipt data
const DEFAULT_RECEIPT_DATA: ReceiptData = {
  employee: "Unknown",
  pos: "",
  items: [],
  total: "#0.00",
  paymentMethod: "Cash",
  paymentAmount: "#0.00",
  dateTime: new Date().toLocaleString(),
  receiptNumber: "0-0000",
}

const Scanner = () => {
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(true)

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
  const [receiptData, setReceiptData] = useState<ReceiptData>(DEFAULT_RECEIPT_DATA)
  // New state to track if a receipt has been successfully processed
  const hasProcessedReceipt = useRef(false);

  const CONNECTION_CHECK_INTERVAL = 6000
  const DATA_LOADING_TIMEOUT = 2000 // Increased slightly for robustness

  // Reset all states when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset states when screen comes into focus
      resetAllStates()

      return () => {
        // Clean up when screen loses focus
        cleanupOnExit()
      }
    }, []),
  )

  // Function to reset all states to initial values
  const resetAllStates = () => {
    setShowReceiptDialog(false)
    setIsDataLoading(false)
    setCameraActive(true)
    qrLock.current = false
    setScannedAddress(null)
    setFullDataBuffer([])
    setReceiptData(DEFAULT_RECEIPT_DATA)
    isReceivingData.current = false
    hasProcessedReceipt.current = false // Reset this flag as well

    // Don't reset Bluetooth connection states here
    // as they will be initialized in the useEffect
  }

  // Function to clean up resources when exiting
  const cleanupOnExit = () => {
    cleanupDataSubscription()
    disconnectFromDevice()
    if (connectionInterval) {
      clearInterval(connectionInterval)
      setConnectionInterval(null)
    }
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
      dataTimeoutRef.current = null
    }
  }

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
        setIsDataLoading(false); // Reset loading state on unexpected disconnect
        qrLock.current = false; // Unlock QR scanning
        isReceivingData.current = false; // Reset data receiving flag
        hasProcessedReceipt.current = false; // Reset processed flag
      }
    })

    return () => {
      mounted = false
      cleanupOnExit()
      disconnectListener.remove()
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
      // Only process if data is loading and we haven't already processed a receipt
      if (fullDataBuffer.length > 0 && isDataLoading && !hasProcessedReceipt.current) {
        console.log("📊 Data reception timeout - assuming data is complete")
        setIsDataLoading(false)
        isReceivingData.current = false; // Important: Stop receiving data

        const completeData = fullDataBuffer.join(" ")
        formatPrinterData(completeData) // This updates receiptData state

        // Now that data is processed, set the flag and show the dialog
        hasProcessedReceipt.current = true;
        setShowReceiptDialog(true)

        // Immediately clean up the subscription after data is considered complete
        cleanupDataSubscription();
      }
    }, DATA_LOADING_TIMEOUT)
  }

  // Modified useEffect to handle data loading state
  useEffect(() => {
    // This useEffect will now primarily set the loading state and kick off the timeout.
    // The actual processing and dialog display will happen in resetDataTimeout once data is complete.
    if (fullDataBuffer.length > 0 && isReceivingData.current && !hasProcessedReceipt.current) {
      setIsDataLoading(true)
      setCameraActive(false) // Turn off camera when loading data
      resetDataTimeout()
    } else if (fullDataBuffer.length === 0 && !isReceivingData.current && !isDataLoading) {
        // This condition ensures camera is active when no data is expected or being processed
        setCameraActive(true);
    }
  }, [fullDataBuffer, isReceivingData.current, isDataLoading, hasProcessedReceipt.current]);

  const cleanupDataSubscription = () => {
    if (dataSubscription) {
      console.log("Removing existing data subscription")
      dataSubscription.remove()
      setDataSubscription(null)
    }
    // Only set this to false if we explicitly know we're done with a data read cycle.
    // This is now managed more directly after `dataTimeoutRef` processes the data.
    // isReceivingData.current = false;

    // Also clear any data timeout
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
      dataTimeoutRef.current = null
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // Only reset qrLock if not currently in data loading or receiving state
        if (!isDataLoading && !isReceivingData.current) {
            qrLock.current = false
        }
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
  }, [isDataLoading, isReceivingData.current]) // Depend on these to react to their changes

  const startReadingFromDevice = async (device: BluetoothDevice) => {
    // If already receiving data, don't start a new read operation
    if (isReceivingData.current || isDataLoading) {
      console.log("⚠️ Already receiving data or loading, ignoring new read request")
      return
    }

    if (!device) return

    try {
      // Clear previous data buffer and reset flags for a new read
      setFullDataBuffer([])
      hasProcessedReceipt.current = false; // Crucial: prepare for a new receipt
      isReceivingData.current = true; // Set this early to prevent re-entry

      // Show a loading indicator while waiting to start reading
      setDeviceStatus(`Connected to ${device.name || device.address}. Preparing to read data...`)

      console.log("📤 Sending scan2flow command to device...")

      // Send the scan2flow command to the device
      try {
        await device.write("scan2flow")
        console.log("✅ scan2flow command sent successfully")
      } catch (writeError) {
        console.error("❌ Error sending scan2flow command:", writeError)
        setDeviceStatus(
          `Error sending command: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
        )
        isReceivingData.current = false; // Reset if command fails
        setIsDataLoading(false);
        setCameraActive(true);
        qrLock.current = false;
        return
      }

      // Add a delay before starting to read data
      console.log("⏳ Waiting for device to process command...")

      // Wait 2 seconds before starting to read data (giving device time to process the command)
      setTimeout(() => {
        setIsDataLoading(true) // Start loading state when we expect data
        setCameraActive(false) // Turn off camera during data reception

        console.log(`👂 Setting up data listener for device: ${device.name || device.address}`)

        cleanupDataSubscription() // Ensure any old subscription is gone

        // Create new subscription
        const subscription = device.onDataReceived((data) => {
          console.log("Raw data buffer:", data.data)

          // Only process data if we are explicitly expecting it and haven't processed a receipt yet
          if (data && data.data && isReceivingData.current && !hasProcessedReceipt.current) {
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
          } else if (hasProcessedReceipt.current) {
              console.log("⚠️ Ignoring data: Receipt already processed for this session.")
              cleanupDataSubscription(); // Ensure listener is removed if data arrives after processing
          } else {
            console.log("⚠️ Received data object is empty or undefined, or not expecting data.")
          }
        })

        setDataSubscription(subscription)
        console.log("✅ Data listener established successfully")
      }, 2000) // 2 second delay (increased from 1.5s to give more time after command)
    } catch (error) {
      console.error("❌ Error setting up data listener:", error)
      console.log(`Error setting up data listener: ${error instanceof Error ? error.message : String(error)}`)
      isReceivingData.current = false
      setIsDataLoading(false)
      qrLock.current = false
      setCameraActive(true); // Re-enable camera on error
      hasProcessedReceipt.current = false;
      cleanupDataSubscription(); // Clean up if an error occurs during setup
    }
  }

  const sendScan2FlowCommand = async () => {
    if (!connectedDevice) {
      setDeviceStatus("No device connected")
      return
    }

    // Reset for a new scan operation
    setFullDataBuffer([]);
    hasProcessedReceipt.current = false;
    isReceivingData.current = false; // Ensure it's false before starting new read
    setIsDataLoading(false);
    setCameraActive(false); // Camera off immediately when command is sent

    try {
      setDeviceStatus("Sending scan2flow command...")
      await connectedDevice.write("scan2flow")
      setDeviceStatus("scan2flow command sent successfully")
      // After sending command, immediately attempt to read from device
      await startReadingFromDevice(connectedDevice);
    } catch (error) {
      console.error("Error sending scan2flow command:", error)
      setDeviceStatus(`Error sending command: ${error instanceof Error ? error.message : String(error)}`)
      setIsDataLoading(false);
      setCameraActive(true);
      qrLock.current = false;
      isReceivingData.current = false;
      hasProcessedReceipt.current = false;
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
            isReceivingData.current = false; // Reset data receiving flag
            hasProcessedReceipt.current = false; // Reset processed flag
            setCameraActive(true); // Re-enable camera
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
          isReceivingData.current = false; // Reset data receiving flag
          hasProcessedReceipt.current = false; // Reset processed flag
          setCameraActive(true); // Re-enable camera
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
        isReceivingData.current = false; // Reset data receiving flag
        hasProcessedReceipt.current = false; // Reset processed flag
        setCameraActive(true); // Re-enable camera
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
    // If already receiving data or loading, don't allow new connections
    if (isReceivingData.current || isDataLoading) {
      console.log("⚠️ Already processing data, ignoring new connection request")
      return
    }

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
        setCameraActive(true); // Re-enable camera
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

      // Clear old data and reset flags for a fresh start
      setFullDataBuffer([])
      setIsDataLoading(false)
      isReceivingData.current = false; // Important: ensure false before starting new read
      hasProcessedReceipt.current = false;
      setCameraActive(false); // Camera off during connection and initial data read

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
      setIsDataLoading(false)
      qrLock.current = false // Unlock QR scanning on error
      isReceivingData.current = false; // Reset data receiving flag
      hasProcessedReceipt.current = false; // Reset processed flag
      setCameraActive(true); // Re-enable camera on error
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

  const handleBarcodeScanned = async ({ data }: any) => {
    // If already locked, receiving data, or loading, don't allow new scans
    if (qrLock.current || isReceivingData.current || isDataLoading) {
      console.log("⚠️ Already processing data or locked, ignoring new scan")
      return
    }

    if (data) {
      // Trigger haptic feedback immediately when QR code is scanned
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        console.log("✅ Haptic feedback triggered")
      } catch (error) {
        console.log("⚠️ Haptic feedback failed:", error)
      }

      // Lock immediately to prevent double scans
      qrLock.current = true
      console.log("QR Code scanned, MAC address:", data)

      const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/
      if (!macAddressRegex.test(data)) {
        setDeviceStatus("Invalid MAC address format in QR code")
        setTimeout(() => {
          qrLock.current = false
          setCameraActive(true); // Re-enable camera after invalid scan
        }, 3000)
        return
      }

      setScannedAddress(data)

      // Show a confirmation dialog before connecting
      Alert.alert("Connect to Device", `Do you want to connect to device with address: ${data}?`, [
        {
          text: "Cancel",
          onPress: () => {
            qrLock.current = false
            setCameraActive(true); // Re-enable camera after cancel
            console.log("🔓 Connection cancelled - QR lock reset")
          },
          style: "cancel",
        },
        {
          text: "Connect",
          onPress: () => connectToDevice(normalizeMacAddress(data)),
        },
      ])
    }
  }

  // Handle closing the receipt dialog and clearing data
  const handleCloseReceiptDialog = () => {
    setShowReceiptDialog(false)

    // Reset states to enable scanning again
    setCameraActive(true)
    qrLock.current = false
    isReceivingData.current = false; // Ensure this is false
    hasProcessedReceipt.current = false; // Ensure this is false

    // Clear the data
    setFullDataBuffer([])
    setReceiptData(DEFAULT_RECEIPT_DATA)

    console.log("🧹 Receipt dialog closed - data cleared, ready for new scan")
  }

  // Handle back button press
  const handleBackPress = () => {
    // Clean up and disconnect
    disconnectFromDevice()

    // Clear all data before navigating back
    setFullDataBuffer([])
    setReceiptData(DEFAULT_RECEIPT_DATA)

    // Navigate back
    router.back()
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
          <Text style={{ color: "#00ff00", marginTop: 16, fontWeight: "bold" }} className="text-xl">
            Generating Receipt . . .
          </Text>
          <Text
            className="w-[70%] text-sm"
            style={{ color: "#ffffff", marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}
          >
            Please keep your device connected & wait while we process the receipt data
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
            <Text className="text-white text-center text-sm mt-2">
              {deviceStatus.includes("scan2flow") ? "Scanflow: Command Sent" : deviceStatus}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View
        className="w-[85%] pt-6 flex justify-center m-auto bottom-8"
        entering={FadeInDown.duration(300).delay(200).springify()}
      >
        <SolidButtonArrowLeft text="Back" onPress={handleBackPress} />
      </Animated.View>

      <ReceiptDialog visible={showReceiptDialog} onDismiss={handleCloseReceiptDialog} receiptData={receiptData} />
    </SafeAreaView>
  )
}

export default Scanner