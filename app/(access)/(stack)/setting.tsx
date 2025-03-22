import { MyTopBarLeft } from '@/components/MyTopBar'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const setting = () => {
  return (
    <SafeAreaView className='bg-[#010101] pt-7'>
        <MyTopBarLeft text='Settings' onPress={()=>router.back()}/>
        <Text>settings</Text>
    </SafeAreaView>
  )
}

export default setting