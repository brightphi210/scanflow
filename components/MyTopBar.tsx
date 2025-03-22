import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TabProps {
    text: string;
    onPress?: () => void;
}
export const MyTopBar = ({text, onPress}: TabProps) => {
  return (
    <View className='flex flex-row justify-between items-center px-5'>
        <View>
          <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>👋 {text} Swifties </Text>
        </View>
        
        <TouchableOpacity onPress={onPress} className='bg-neutral-800 border-2 border-neutral-700 p-2 py-1.5 rounded-md'>
            <Ionicons name='menu' color={'white'} size={25} />
        </TouchableOpacity>
    </View>
  )
}


export const MyTopBarLeft = ({text, onPress}: TabProps) => {
  return (
    <View className='flex flex-row justify-between items-center px-5'>
        <TouchableOpacity onPress={onPress} className='bg-neutral-800 border-2 border-neutral-700 p-2 py-1.5 rounded-md'>
            <Ionicons name='chevron-back' color={'white'} size={25} />
        </TouchableOpacity>
        <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>{text}</Text>
    </View>
  )
}