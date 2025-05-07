// import { MyTopBar, MyTopBarHistory } from '@/components/MyTopBar';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { Link, router } from 'expo-router';
// import { useState } from 'react';
// import { Text, TouchableOpacity } from 'react-native';
// import { StyleSheet, Image, Platform, Pressable, View } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Dialog } from 'react-native-ui-lib';


// export default function TabTwoScreen() {

//     const [isOpen, setIsOpen] = useState(false)
  
//     const openDialog = () => {
//       setIsOpen(true)
//     }
  
//     const closeDialog = () => {
//       setIsOpen(false)
//     }


//   return (
//     <SafeAreaView className='pt-7  flex-1 bg-[#010101]'>
//       <MyTopBarHistory text='History' onPress={()=>router.push('/setting')}/>
//       <ScrollView className='px-5 pt-8'>
//         <Pressable className='p-4 bg-neutral-900 mb-4 rounded-2xl flex flex-row items-center justify-between'>
//           <View className='flex flex-row items-center gap-3'>
//             <Image 
//               source={require("../../../assets/images/icon.png")}
//               className='w-10 h-10'
//             />
//             <View>
//               <Text className='text-white text-sm' style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
//               <Text className='text-neutral-400 text-[12px] ' style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
//             </View>
//           </View>

//           <TouchableOpacity onPress={openDialog} className='flex justify-center items-center bg-neutral-700 p-2 rounded-full'>
//             <MaterialIcons name='more-vert' size={15} color='white' />
//           </TouchableOpacity>
//         </Pressable>

//       </ScrollView>

//       <Dialog 
//         center
//         visible={isOpen} 
//         onDismiss={closeDialog}
//         containerStyle={{
//           backgroundColor: "#262626",
//           borderRadius: 15,
//           padding: 30,
//           borderWidth: 2,
//           borderColor: "#333333",
//           shadowColor: "#000",
//           display: 'flex',
//           marginHorizontal: 40
//         }}
//       >
//         <View className="items-center mb-4">
//           <Text className="text-white text-lg mb-1" style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
//           <Text className="text-neutral-400 text-sm text-center" style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
//         </View>
        
//         <View className="flex-row gap-4 justify-center mt-4">
  
//           <Link href={`/single-scan/${2}` } asChild>
//             <TouchableOpacity 
//               onPress={() => {}}
//               className="bg-neutral-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
//             >
//               <MaterialIcons name="visibility" size={18} color="white" />
//               <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>View</Text>
//             </TouchableOpacity>
//           </Link>
          
//           <TouchableOpacity 
//             onPress={() => {
//               closeDialog();
//             }}
//             className="bg-red-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
//           >
//             <MaterialIcons name="delete" size={18} color="white" />
//             <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </Dialog>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   headerImage: {
//     color: '#808080',
//     bottom: -90,
//     left: -35,
//     position: 'absolute',
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
// });





import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ReceiptScreen() {
  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReceiptData()
  }, [])

  const loadReceiptData = async () => {
    try {
      setLoading(true)
      const data = await AsyncStorage.getItem("receiptsData")

      if (data) {
        console.log("Receipt data loadedd:", data.length)
      }
    } catch (error) {
      console.error("Failed to load receipt data:", error)
    } finally {
      setLoading(false)
    }
  }



  // const loadReceiptData = async () => {
  //   try {
  //     setLoading(true)
  //     const data = await AsyncStorage.getItem("receiptData")

  //     if (data) {
  //       const parsedReceipt = parseReceiptData(data)
  //       setReceipt(parsedReceipt)
  //     }
  //   } catch (error) {
  //     console.error("Failed to load receipt data:", error)
  //     Alert.alert("Error", "Failed to load receipt data")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const parseReceiptData = (rawData: string) => {
  //   // Extract the relevant information from the raw data
  //   const storeName = rawData.match(/Bright|[A-Za-z]+ (?=Employee)/)?.[0] || ""
  //   const employee = rawData.match(/Employee: ([A-Za-z]+)/)?.[1] || ""
  //   const pos = rawData.match(/POS: ([A-Za-z0-9 ]+)/)?.[1] || ""

  //   // Extract items and prices
  //   const itemsRegex = /([A-Za-z ]+) #([\d,.]+)(?:\s+(\d+) x #([\d,.]+))?/g
  //   const items = []
  //   let match

  //   while ((match = itemsRegex.exec(rawData)) !== null) {
  //     items.push({
  //       name: match[1].trim(),
  //       price: match[2],
  //       quantity: match[3] || "1",
  //       total: match[4] || match[2],
  //     })
  //   }

  //   // Extract total amount
  //   const total = rawData.match(/Total #([\d,.]+)/)?.[1] || ""

  //   // Extract payment method and amount
  //   const paymentMethod = rawData.match(/Cash|Card|Transfer/)?.[0] || "Cash"
  //   const paymentAmount = rawData.match(/(Cash|Card|Transfer) #([\d,.]+)/)?.[2] || ""

  //   // Extract date and receipt number
  //   const dateTime = rawData.match(/(\d{2}\/\d{2}\/\d{4} \d{1,2}:\d{2} [ap]m)/)?.[1] || ""
  //   const receiptNumber = rawData.match(/#(\d+-\d+)/)?.[1] || ""

  //   return {
  //     storeName,
  //     employee,
  //     pos,
  //     items,
  //     total,
  //     paymentMethod,
  //     paymentAmount,
  //     dateTime,
  //     receiptNumber,
  //   }
  // }

  const clearReceiptData = async () => {
    Alert.alert(
      "Clear Receipt",
      "Are you sure you want to clear this receipt data?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("receiptData")
              setReceipt(null)
              Alert.alert("Success", "Receipt data cleared successfully")
            } catch (error) {
              console.error("Failed to clear receipt data:", error)
              Alert.alert("Error", "Failed to clear receipt data")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="mt-4 text-gray-600">Loading receipt...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // if (!receipt) {
  //   return (
  //     <SafeAreaView className="flex-1 bg-white">
  //       <View className="flex-1 justify-center items-center p-6">
  //         <Text className="text-xl text-gray-800 mb-4">No receipt data found</Text>
  //         <TouchableOpacity className="bg-blue-500 py-3 px-6 rounded-lg" onPress={loadReceiptData}>
  //           <Text className="text-white font-medium">Refresh</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   )
  // }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-6 ">
          {/* Receipt Header */}
          {/* <View className="items-center mb-4 border-b border-gray-200 pb-4">
            <Text className="text-2xl font-bold mb-1">{receipt.storeName}</Text>
            <Text className="text-gray-600">Employee: {receipt.employee}</Text>
            <Text className="text-gray-600 mb-2">POS: {receipt.pos}</Text>
          </View> */}

          {/* Receipt Items */}
          {/* <View className="mb-4">
            {receipt.items.map((item, index) => (
              <View key={index} className="flex-row justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-gray-800">{item.name}</Text>
                  {item.quantity !== "1" && (
                    <Text className="text-gray-500 text-sm">
                      {item.quantity} x #{item.price}
                    </Text>
                  )}
                </View>
                <Text className="text-gray-800 font-medium">#{item.total}</Text>
              </View>
            ))}
          </View> */}

          {/* Receipt Total */}
          {/* <View className="border-t border-gray-200 pt-3 mb-4">
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold">#{receipt.total}</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-600">{receipt.paymentMethod}</Text>
              <Text className="text-gray-600">#{receipt.paymentAmount}</Text>
            </View>
          </View> */}

          {/* Receipt Footer */}
          {/* <View className="items-center border-t border-gray-200 pt-4">
            <Text className="text-gray-500">{receipt.dateTime}</Text>
            <Text className="text-gray-500">Receipt #{receipt.receiptNumber}</Text>
          </View> */}

          {/* Clear Button */}
          <TouchableOpacity className="bg-red-500 py-3 rounded-lg mt-8 items-center" onPress={clearReceiptData}>
            <Text className="text-white font-medium">Clear Receipt Data</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-red-500 py-3 rounded-lg mt-8 items-center" onPress={loadReceiptData}>
            <Text className="text-white font-medium">Clear Receipt Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

