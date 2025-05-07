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
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { getReceiptById, deleteReceipt } from '../../../../components/utils/database'
import { SolidButtonArrowLeft } from '@/components/CustomButtons'
import { MyTopBarLeft } from '@/components/MyTopBar'
import { ScrollView } from 'react-native-gesture-handler';


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

  const handleShareReceipt = async () => {
    if (!receipt) return

    try {
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

      <MyTopBarLeft text='' onPress={()=>router.back()}/>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{fontFamily: 'Poppins_600SemiBold'}} className="text-white text-xl">Receipt Details</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleShareReceipt}
              className="bg-blue-600 p-3 rounded-xl mr-2"
            >
              <MaterialIcons name="share" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteReceipt}
              className="bg-orange-600 p-3 rounded-xl"
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