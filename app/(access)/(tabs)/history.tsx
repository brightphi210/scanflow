import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { format, parseISO } from 'date-fns'
import { getAllReceipts, deleteReceipt, initDatabase } from '../../../components/utils/database'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog } from 'react-native-ui-lib';

interface Receipt {
  id: number
  employee: string
  pos: string
  total: string
  paymentMethod: string
  paymentAmount: string
  dateTime: string
  receiptNumber: string
}

const History = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null)

  useEffect(() => {
    // Initialize database and load receipts
    const setupDatabase = async () => {
      try {
        await initDatabase()
        await loadReceipts()
      } catch (error) {
        console.error('Error setting up database:', error)
      }
    }

    setupDatabase()
  }, [])

  const loadReceipts = async () => {
    try {
      setLoading(true)
      const allReceipts = await getAllReceipts()
      setReceipts(allReceipts as Receipt[])
    } catch (error) {
      console.error('Error loading receipts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReceipts()
  }

  const handleViewReceipt = (id: number) => {
    router.push(`/receipt/${id}`)
  }


  const openDeleteDialog = (id: number) => {
    setSelectedReceiptId(id)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedReceiptId(null)
  }

  const confirmDeleteReceipt = async () => {
    if (selectedReceiptId === null) return

    try {
      const success = await deleteReceipt(selectedReceiptId)
      if (success) {
        // Remove from local state
        setReceipts(receipts.filter(receipt => receipt.id !== selectedReceiptId))
      }
    } catch (error) {
      console.error('Error deleting receipt:', error)
    } finally {
      closeDeleteDialog()
    }
  }

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      onPress={() => handleViewReceipt(item.id)}
      className="bg-neutral-800 p-4 rounded-lg mb-3 border border-neutral-700"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text style={{fontFamily: 'Poppins_500Medium'}} className="text-white text-lg">{item.total}</Text>
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-neutral-400 mt-1 text-sm">Receipt #{item.receiptNumber}</Text>
          <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-neutral-400 mt-1 text-sm">{item.dateTime}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleViewReceipt(item.id)}
            className="bg-blue-600 p-3 rounded-2xl mr-2"
          >
            <MaterialIcons name="visibility" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openDeleteDialog(item.id)}
            className="bg-orange-600 p-3 rounded-2xl"
          >
            <MaterialIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className='pt-7 flex-1 bg-[#010101]'>
      {Platform.OS === "ios" ? <StatusBar hidden /> : null}

      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text style={{fontFamily: 'Poppins_600SemiBold'}} className="text-white text-xl">Receipt History</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-neutral-700 p-2 rounded-full"
          >
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white mt-4">Loading receipts...</Text>
          </View>
        ) : receipts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <MaterialIcons name="receipt" size={64} color="#555" />
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-white text-lg mt-4">No receipts found</Text>
            <Text style={{fontFamily: 'Poppins_400Regular'}} className="text-neutral-400 text-center mt-2">
              Scan a receipt QR code to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={receipts}
            renderItem={renderReceiptItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        center
        visible={isDeleteDialogOpen} 
        onDismiss={closeDeleteDialog}
        containerStyle={{
          backgroundColor: "#262626",
          borderRadius: 15,
          padding: 30,
          borderWidth: 2,
          borderColor: "#333333",
          shadowColor: "#000",
          display: 'flex',
          marginHorizontal: 40
        }}
      >
        <View className="items-center mb-4">
          <Text className="text-white text-lg mb-1" style={{fontFamily: 'Poppins_600SemiBold'}}>Delete Receipt</Text>
          <Text className="text-neutral-400 text-sm text-center" style={{fontFamily: 'Poppins_400Regular'}}>
            Are you sure you want to delete this receipt?
          </Text>
        </View>
        
        <View className="flex-row gap-4 justify-center mt-4">          
          <TouchableOpacity 
            onPress={closeDeleteDialog}
            className="bg-neutral-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
          >
            <MaterialIcons name="close" size={18} color="white" />
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={confirmDeleteReceipt}
            className="bg-red-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
          >
            <MaterialIcons name="delete" size={18} color="white" />
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    </SafeAreaView>
  )
}

export default History