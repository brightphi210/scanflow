import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Dialog } from 'react-native-ui-lib'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import { saveReceipt } from '../../../components/utils/database'

interface ReceiptDialogProps {
  visible: boolean
  onDismiss: () => void
  receiptData: any
}

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({ visible, onDismiss, receiptData }) => {
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSaveReceipt = async () => {
    try {
      setIsSaving(true)
      
      // Save receipt to SQLite database
      await saveReceipt(receiptData)
      
      console.log('✅ Receipt saved to SQLite database')
      setIsSaving(false)
      onDismiss()
      
      // Navigate to the history screen after saving
      router.push('/history')
    } catch (error) {
      console.error('❌ Failed to save receipt to database:', error)
      setIsSaving(false)
    }
  }

  // Function to format items from the receipt data
  const renderItems = () => {
    if (Array.isArray(receiptData.items)) {
      return receiptData.items.map((item: any, index: number) => (
        <View key={index} className="py-4 border-b border-neutral-500 border-dashed">
          <View className="flex flex-row justify-between items-center">
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{item.name}</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{item.price}</Text>
          </View>
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-sm pt-1">{item.quantity}</Text>
        </View>
      ))
    }
    return null
  }

  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      containerStyle={{
        backgroundColor: 'transparent',
      }}
    >
      <View className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="border-b border-neutral-500 border-dashed pb-3">
            <Text className="text-center text-xl text-white pb-3" style={{fontFamily: 'Poppins_500Medium'}}>RECEIPT</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-sm text-center text-neutral-400">{receiptData.dateTime}</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-sm text-center text-neutral-400">#{receiptData.receiptNumber}</Text>
          </View>

          {/* Employee Info */}
          <View className="pt-5">
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base pb-1">Employee: {receiptData.employee}</Text>
            {receiptData.pos && (
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base pb-3">POS: {receiptData.pos}</Text>
            )}
            
            {/* Items */}
            <View className="pt-2">
              {renderItems()}
            </View>
          </View>

          {/* Total and Payment */}
          <View className="mt-4 border-t border-neutral-500 border-dashed pt-4">
            <View className="flex flex-row justify-between items-center pb-2">
              <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg">Total</Text>
              <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg">{receiptData.total}</Text>
            </View>
            <View className="flex flex-row justify-between items-center">
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{receiptData.paymentMethod}</Text>
              <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-base">{receiptData.paymentAmount}</Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-6 flex flex-row justify-between">
            <TouchableOpacity 
              onPress={onDismiss}
              className="bg-neutral-700 px-5 py-3 rounded-lg flex-1 mr-3 flex flex-row justify-center items-center"
              disabled={isSaving}
            >
              <MaterialIcons name="close" size={18} color="#fff" />
              <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-base ml-2">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSaveReceipt}
              className="bg-green-600 px-5 py-3 rounded-lg flex-1 flex flex-row justify-center items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-base ml-2">Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Dialog>
  )
}

export default ReceiptDialog