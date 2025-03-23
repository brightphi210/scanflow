import { MyTopBarLeft } from '@/components/MyTopBar'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Checkbox, Switch } from 'react-native-ui-lib'

const setting = () => {
  const [isChecked, setChecked] = useState(false);
  const [isChecked1, setChecked1] = useState(false);
  return (
    <SafeAreaView className='bg-[#010101] pt-7'>
      <MyTopBarLeft text='Settings' onPress={()=>router.back()}/>
      <View className='pt-8 px-5'>
        <View className='bg-neutral-900 rounded-xl mb-5 flex-row justify-between items-center gap-3 p-4'>
          <View className='flex-row gap-6 items-center'>
            <MaterialIcons name='vibration' color={'#2958FF'} size={32}/>
            <View>
              <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>Vibrate</Text>
              <Text className='text-neutral-300' style={{fontFamily: 'Poppins_400Regular'}}>Vibration when scan is done.</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Switch
              value={isChecked}
              onValueChange={setChecked}
              style={{
                backgroundColor: isChecked === false? 'gray' : '#2958FF',
                borderColor: isChecked === false? 'gray' : '#2958FF',
              }}
              thumbColor={isChecked === false? 'white' : '#2958FF'}
            />
          </TouchableOpacity>
        </View>

        <View className='bg-neutral-900 rounded-xl mb-5 flex-row justify-between items-center gap-3 p-4'>
          <View className='flex-row gap-6 items-center'>
            <MaterialIcons name='notifications-active' color={'#2958FF'} size={32}/>
            <View>
              <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>Beep</Text>
              <Text className='text-neutral-300' style={{fontFamily: 'Poppins_400Regular'}}>Beep when scan is done.</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Switch
              value={isChecked1}
              onValueChange={setChecked1}
              style={{
                backgroundColor: isChecked1 === false? 'gray' : '#2958FF',
                borderColor: isChecked1 === false? 'gray' : '#2958FF',
              }}
              thumbColor={isChecked1 === false? 'white' : '#2958FF'}
            />
          </TouchableOpacity>
        </View>

        <Text className='text-xl pt-8 pb-4 text-white' style={{fontFamily: 'Poppins_600SemiBold'}}>Support</Text>
        <View className='bg-neutral-900 border-2 border-neutral-800 rounded-xl mb-5 flex-col gap-3 '>
          <TouchableOpacity className='flex-row gap-6 items-center p-4 border-b-2 border-neutral-600'>
            <MaterialIcons name='check-circle' color={'#2958FF'} size={26}/>
            <View>
              <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>Rate Us</Text>
              <Text className='text-neutral-300' style={{fontFamily: 'Poppins_400Regular'}}>Your best reward to us.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className='flex-row gap-6 items-center p-4 border-b-2 border-neutral-600'>
            <MaterialIcons name='share' color={'#2958FF'} size={26}/>
            <View>
              <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>Share</Text>
              <Text className='text-neutral-300' style={{fontFamily: 'Poppins_400Regular'}}>Share app with others.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className='flex-row gap-6 items-center p-4'>
            <MaterialIcons name='shield-moon' color={'#2958FF'} size={26}/>
            <View>
              <Text className='text-white text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>Privacy Policy</Text>
              <Text className='text-neutral-300' style={{fontFamily: 'Poppins_400Regular'}}>Follow our policies that benefits you.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default setting