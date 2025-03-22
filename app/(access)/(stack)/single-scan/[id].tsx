import { MyTopBarLeft } from '@/components/MyTopBar'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

const SingleScan = () => {
  return (
    <SafeAreaView className='bg-[#010101] flex-1'>
      <View className='pt-7 px-5 flex-1'>
        <MyTopBarLeft text='Details' onPress={()=>router.push('/home')}/>
        
        <ScrollView 
          showsVerticalScrollIndicator={true} 
          className='bg-[#0E0E0E] mt-7 mb-5 p-7 border border-[#2958FF] rounded-xl'
          contentContainerStyle={{ paddingBottom: 20 }}
        >
            <View className='flex-row justify-between items-center border-b border-b-neutral-800 pb-4'>
                <View className='flex flex-row items-center gap-2'>
                    <Image 
                        source={require("../../../../assets/images/icon.png")}
                        className='w-10 h-10'
                    />
                    <View>
                        <Text className='text-[#ffffff] text-base font-semibold'>Scan ID: 123456</Text>
                        <Text className='text-[#ffffff] text-xs'>Date: 2021-01-01</Text>
                    </View>
                </View>

                <View className='flex-row gap-4'>
                    <TouchableOpacity className='bg-[#2958FF] w-fit p-2 rounded-lg'>
                        <MaterialIcons name='share' color={'white'} size={17}/>
                    </TouchableOpacity>

                    <TouchableOpacity className='bg-[#2958FF] w-fit p-2 rounded-lg'>
                        <MaterialIcons name='content-copy' color={'white'} size={17}/>
                    </TouchableOpacity>
                </View>
            </View>

            <View className='pt-5'>
                <View className='flex-row justify-between'>
                    <Text className='text-[#2958FF] text-base font-medium'>Description:</Text>
                    <Text className='text-[#2958FF] text-base font-medium'>Price:</Text>
                </View>
                <View className='pt-3 flex-col gap-4 border-b-2 border-neutral-800 pb-4'>
                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>Fried Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N5,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>Juice</Text>
                        <Text className='text-[#ffffff] text-sm'>N2,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>Green Apple</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>

                    <View className='flex-row justify-between bg-neutral-900 px-4 p-4 rounded-md'>
                        <Text className='text-[#ffffff] text-sm'>2 Packs of Jellof Rice</Text>
                        <Text className='text-[#ffffff] text-sm'>N15,000</Text>
                    </View>
                </View>

                <View className='pb-5'>
                    <View className='flex-row justify-between pt-8'>
                        <Text className='text-[#2958FF] text-base font-medium'>Total:</Text>
                        <Text className='text-[#2958FF] text-base font-medium'>N100,000</Text>
                    </View>

                    <View className='pt-8 flex-col gap-4 pb-4'>
                        <View className='flex-row justify-between border-b border-neutral-700 pb-4 rounded-md'>
                            <Text className='text-[#ffffff] text-sm'>Cash</Text>
                            <Text className='text-[#ffffff] text-sm'>N20.0</Text>
                        </View>

                        <View className='flex-row justify-between border-b border-neutral-700 pb-4 rounded-md'>
                            <Text className='text-[#ffffff] text-sm'>Cash</Text>
                            <Text className='text-[#ffffff] text-sm'>N20.0</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default SingleScan