"use client"

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Share,
  Alert,
  Modal,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { getReceiptById, deleteReceipt } from '../../../../components/utils/database'
import { SolidButtonArrowLeft } from '@/components/CustomButtons'
import { MyTopBarLeft } from '@/components/MyTopBar'
import { ScrollView } from 'react-native-gesture-handler'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

interface ReceiptItem {
  id: number
  name: string
  price: string
  quantity: string
  receiptId: number
}

interface ReceiptDetail {
  id: number
  employee: string
  pos: string
  total: string
  paymentMethod: string
  paymentAmount: string
  dateTime: string
  receiptNumber: string
  items: ReceiptItem[]
}

const ReceiptDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        if (!id) return
        
        setLoading(true)
        const receiptData = await getReceiptById(parseInt(id))
        
        if (receiptData) {
          setReceipt(receiptData as ReceiptDetail)
        } else {
          Alert.alert('Error', 'Receipt not found')
          router.back()
        }
      } catch (error) {
        console.error('Error loading receipt details:', error)
        Alert.alert('Error', 'Failed to load receipt details')
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadReceipt()
  }, [id])

  const handleDeleteReceipt = () => {
    if (!receipt) return

    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteReceipt(receipt.id)
              if (success) {
                router.replace('/history')
              } else {
                Alert.alert('Error', 'Failed to delete receipt')
              }
            } catch (error) {
              console.error('Error deleting receipt:', error)
              Alert.alert('Error', 'Failed to delete receipt')
            }
          }
        }
      ]
    )
  }

  const generateReceiptHTML = (receipt: ReceiptDetail): string => {
    const itemsHTML = receipt.items.map(item => `
      <tr>
        <td style="padding: 20px 0; border-bottom: 2px dashed #333; font-size: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 26px; line-height: 1.3;">${item.name}</div>
              <div style="font-size: 22px; color: #555; font-style: italic;">${item.quantity}</div>
            </div>
            <div style="font-weight: 700; font-size: 26px; text-align: right; min-width: 120px;">${item.price}</div>
          </div>
        </td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt #${receipt.receiptNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 30px;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              width: 100%;
              height: 100vh;
              padding: 40px;
              background: white;
              color: #000;
              font-size: 15px;
              line-height: 1.4;
              display: flex;
              flex-direction: column;
            }
            
            .receipt-container {
              width: 100%;
              max-width: 100%;
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px dashed #000;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            
            .receipt-title {
              font-size: 35px;
              font-weight: bold;
              margin-bottom: 20px;
              letter-spacing: 4px;
            }
            
            .receipt-info {
              font-size: 25px;
              color: #333;
              margin: 8px 0;
              font-weight: 500;
            }
            
            .employee-section {
              margin: 30px 0;
              padding: 25px;
              background-color: #f8f8f8;
              border-radius: 8px;
              border: 2px solid #e0e0e0;
            }
            
            .employee-info {
              font-size: 24px;
              font-weight: 600;
              margin: 10px 0;
              color: #222;
            }
            
            .items-section {
              flex: 1;
              margin: 30px 0;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 24px;
            }
            
            .section-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 25px;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            
            .total-section {
              border-top: 3px dashed #000;
              padding-top: 30px;
              margin-top: 40px;
              background-color: #f5f5f5;
              padding: 30px;
              border-radius: 8px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 15px 0;
              font-size: 28px;
              font-weight: 600;
            }
            
            .total-amount {
              font-weight: bold;
              font-size: 25px;
              color: #000;
              border: 2px solid #000;
              padding: 10px 20px;
              border-radius: 5px;
              background-color: #fff;
            }
            
            .payment-row {
              font-size: 24px !important;
              font-weight: 500 !important;
              color: #444;
              margin-top: 20px !important;
              padding-top: 15px;
              border-top: 1px solid #ccc;
            }
            
            .footer {
              text-align: center;
              margin-top: 50px;
              font-size: 22px;
              color: #666;
              font-style: italic;
              padding: 20px;
              border-top: 1px solid #ddd;
            }
            
            .thank-you {
              font-size: 28px;
              font-weight: 600;
              color: #000;
              margin-bottom: 10px;
            }
            
            .business-info {
              font-size: 18px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="receipt-title">RECEIPT</div>
              <div class="receipt-info">${receipt.dateTime}</div>
              <div class="receipt-info">Receipt #${receipt.receiptNumber}</div>
            </div>

            <div class="employee-section">
              <div class="employee-info"><strong>Employee:</strong> ${receipt.employee}</div>
              ${receipt.pos ? `<div class="employee-info"><strong>POS Terminal:</strong> ${receipt.pos}</div>` : ''}
            </div>

            <div class="items-section">
              <div class="section-title">Items Purchased</div>
              <table class="items-table">
                ${itemsHTML}
              </table>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span><strong>TOTAL AMOUNT:</strong></span>
                <span class="total-amount">${receipt.total}</span>
              </div>
              <div class="total-row payment-row">
                <span><strong>Payment Method:</strong> ${receipt.paymentMethod}</span>
                <span><strong>Amount Paid:</strong> ${receipt.paymentAmount}</span>
              </div>
            </div>

            <div class="footer">
              <div class="thank-you">Thank you for your business!</div>
              <div class="business-info">Generated on ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const handleShareReceiptAsPDF = async () => {
    if (!receipt) return
    setShareModalVisible(true)
  }

  const generateAndSharePDF = async () => {
    if (!receipt) return

    try {
      setShareModalVisible(false)
      setGeneratingPDF(true)

      const htmlContent = generateReceiptHTML(receipt)
      
      // Generate PDF with better options
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 595,  // A4 width in points
        height: 842, // A4 height in points
      })

      // Create a more descriptive filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `Receipt_${receipt.receiptNumber}_${timestamp}.pdf`
      const newPath = `${FileSystem.documentDirectory}${filename}`

      // Move the file to a permanent location with a better name
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      })

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()
      
      if (isAvailable) {
        await Sharing.shareAsync(newPath, {
          mimeType: 'application/pdf',
          dialogTitle: `Receipt #${receipt.receiptNumber}`,
        })
      } else {
        // Fallback to native Share if expo-sharing is not available
        await Share.share({
          url: newPath,
          title: `Receipt #${receipt.receiptNumber}`,
        })
      }

    } catch (error) {
      console.error('Error generating/sharing PDF:', error)
      Alert.alert('Error', 'Failed to generate or share PDF. Please try again.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleShareReceipt = async () => {
    if (!receipt) return

    try {
      setShareModalVisible(false)
      
      // Create a text representation of the receipt
      let receiptText = `Receipt #${receipt.receiptNumber}\n`
      receiptText += `Date: ${receipt.dateTime}\n`
      receiptText += `Employee: ${receipt.employee}\n`
      
      if (receipt.pos) {
        receiptText += `POS: ${receipt.pos}\n`
      }
      
      receiptText += '\nItems:\n'
      receipt.items.forEach(item => {
        receiptText += `- ${item.name}: ${item.price} (${item.quantity})\n`
      })
      
      receiptText += `\nTotal: ${receipt.total}\n`
      receiptText += `Payment: ${receipt.paymentMethod} - ${receipt.paymentAmount}\n`

      await Share.share({
        message: receiptText,
        title: `Receipt #${receipt.receiptNumber}`
      })
    } catch (error) {
      console.error('Error sharing receipt:', error)
      Alert.alert('Error', 'Failed to share receipt')
    }
  }

  // Share Modal Component
  const ShareModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={shareModalVisible}
      onRequestClose={() => setShareModalVisible(false)}
    >
      <Pressable 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onPress={() => setShareModalVisible(false)}
      >
        <Pressable 
          style={{
            backgroundColor: '#1f1f1f',
            borderRadius: 10,
            padding: 25,
            margin: 20,
            width: '85%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: '#333',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{fontFamily: 'Poppins_600SemiBold'}} className="text-white text-xl">
              Share Receipt
            </Text>
            <TouchableOpacity 
              onPress={() => setShareModalVisible(false)}
              className="p-2"
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-neutral-300 text-base mb-6 text-center">
            Choose how you'd like to share this receipt:
          </Text>

          {/* Share Options */}
          <View className="flex-col gap-4">

              <TouchableOpacity
                onPress={handleShareReceipt}
                className="bg-[#2958FF] p-5 rounded-lg flex-row items-center justify-center"
              >
                <MaterialIcons name="text-snippet" size={20} color="#fff" />
                <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-base ml-3">
                  Share as Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={generateAndSharePDF}
                className="bg-green-700 p-5 rounded-lg flex-row items-center justify-center"
              >
                <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
                <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-base ml-3">
                  Share as PDF
                </Text>
              </TouchableOpacity>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        {Platform.OS === "ios" ? <StatusBar hidden /> : null}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white mt-4">Loading receipt details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!receipt) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        {Platform.OS === "ios" ? <StatusBar hidden /> : null}
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="error" size={64} color="#ff0000" />
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-lg mt-4">Receipt not found</Text>
        </View>
        <View className="px-4 pb-6">
          <SolidButtonArrowLeft
            text="Back to History"
            onPress={() => router.push('/history')}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='pt-10 flex-1 bg-[#010101]'>
      {Platform.OS === "ios" ? <StatusBar hidden /> : null}

      {/* Share Modal */}
      <ShareModal />

      {/* PDF Generation Loading Overlay */}
      {generatingPDF && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View className="bg-neutral-800 p-8 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg mt-4">
              Generating PDF...
            </Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-neutral-400 text-sm mt-2">
              Please wait while we create your receipt
            </Text>
          </View>
        </View>
      )}

      <MyTopBarLeft text='' onPress={()=>router.back()}/>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{fontFamily: 'Poppins_600SemiBold'}} className="text-white text-xl">Receipt Details</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleShareReceiptAsPDF}
              className="bg-blue-600 p-3 rounded-xl mr-2"
              disabled={generatingPDF}
            >
              <MaterialIcons name="share" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteReceipt}
              className="bg-orange-600 p-3 rounded-xl"
              disabled={generatingPDF}
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1 bg-neutral-900 rounded-xl p-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="border-b border-neutral-500 border-dashed pb-3">
            <Text className="text-center text-xl text-white pb-3" style={{fontFamily: 'Poppins_500Medium'}}>RECEIPT</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-sm text-center text-neutral-400">{receipt.dateTime}</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-sm text-center text-neutral-400">#{receipt.receiptNumber}</Text>
          </View>

          {/* Employee Info */}
          <View className="pt-5">
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base pb-1">Employee: {receipt.employee}</Text>
            {receipt.pos && (
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base pb-3">POS: {receipt.pos}</Text>
            )}
            
            {/* Items */}
            <View className="pt-2">
              {receipt.items.map((item, index) => (
                <View key={index} className="py-4 border-b border-neutral-500 border-dashed">
                  <View className="flex flex-row justify-between items-center">
                    <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{item.name}</Text>
                    <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{item.price}</Text>
                  </View>
                  <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-sm pt-1">{item.quantity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Total and Payment */}
          <View className="mt-4 border-t border-neutral-500 border-dashed pt-4">
            <View className="flex flex-row justify-between items-center pb-2">
              <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg">Total</Text>
              <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg">{receipt.total}</Text>
            </View>
            <View className="flex flex-row justify-between items-center">
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{receipt.paymentMethod}</Text>
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{receipt.paymentAmount}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default ReceiptDetail