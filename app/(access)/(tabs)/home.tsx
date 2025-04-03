import { Image, StyleSheet, Platform, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {SolidButtonArrow } from '@/components/CustomButtons';
import { Link, router } from 'expo-router';
import {MyTopBar} from '@/components/MyTopBar';
import { ScrollView } from 'react-native-gesture-handler';
import {Dialog} from 'react-native-ui-lib'
import { useState } from 'react';

export default function HomeScreen() {

  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => {
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
  }
  return (
    <SafeAreaView className='pt-7  flex-1 bg-[#010101]'>
      <MyTopBar text='Hello' onPress={()=>router.push('/setting')}/>
      <ScrollView  className='w-full mt-10 px-5' showsVerticalScrollIndicator={true}>
        <Animated.View className="w-full h-[300px] overflow-hidden bg-neutral-900 p-3 py-0 rounded-2xl border-2 border-neutral-800" entering={FadeInDown.duration(300).springify()}>
          <Image
              source={require("../../../assets/images/generate.png")}
              alt="Scan flow Logo"
              style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
              objectFit: 'contain'
            }}
          />
        </Animated.View>

        <Animated.ScrollView className="mt-8 " entering={FadeInDown.duration(300).delay(200).springify()}>
            <View className='flex flex-row '>
              <Text className='text-base text-neutral-400 text-left pb-2' style={{fontFamily: 'Poppins_500Medium'}}>Recent Document</Text>
            </View>
            <ScrollView 
                className='bg-neutral-950 flex flex-col h-[320px] gap-3 rounded-2xl border-2 border-neutral-900 p-3'
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 30 }}
              >

                <Pressable className='p-4 bg-neutral-900 mb-4  rounded-2xl flex flex-row items-center justify-between'>
                  <View className='flex flex-row items-center gap-3'>
                    <Image 
                      source={require("../../../assets/images/icon.png")}
                      className='w-10 h-10'
                    />
                    <View>
                      <Text className='text-white text-sm' style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
                      <Text className='text-neutral-400 text-[12px] ' style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={openDialog} className='flex justify-center items-center bg-neutral-700 p-2 rounded-full'>
                    <MaterialIcons name='more-vert' size={15} color='white' />
                  </TouchableOpacity>
                </Pressable>

                <Pressable className='p-4 bg-neutral-900 mb-4 rounded-2xl flex flex-row items-center justify-between'>
                  <View className='flex flex-row items-center gap-3'>
                    <Image 
                      source={require("../../../assets/images/icon.png")}
                      className='w-10 h-10'
                    />
                    <View>
                      <Text className='text-white text-sm' style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
                      <Text className='text-neutral-400 text-[12px] ' style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={openDialog} className='flex justify-center items-center bg-neutral-700 p-2 rounded-full'>
                    <MaterialIcons name='more-vert' size={15} color='white' />
                  </TouchableOpacity>
                </Pressable>

                <Pressable className='p-4 bg-neutral-900 mb-4 rounded-2xl flex flex-row items-center justify-between'>
                  <View className='flex flex-row items-center gap-3'>
                    <Image 
                      source={require("../../../assets/images/icon.png")}
                      className='w-10 h-10'
                    />
                    <View>
                      <Text className='text-white text-sm' style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
                      <Text className='text-neutral-400 text-[12px] ' style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={openDialog} className='flex justify-center items-center bg-neutral-700 p-2 rounded-full'>
                    <MaterialIcons name='more-vert' size={15} color='white' />
                  </TouchableOpacity>
                </Pressable>

                <SolidButtonArrow text='View More' onPress={()=>router.push('/history')}/>
              
            </ScrollView>
        </Animated.ScrollView>
      </ScrollView>

      <Dialog 
        center
        visible={isOpen} 
        onDismiss={closeDialog}
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
        <Text className="text-white text-lg mb-1" style={{fontFamily: 'Poppins_600SemiBold'}}>ScanFlow - U2045</Text>
        <Text className="text-neutral-400 text-sm text-center" style={{fontFamily: 'Poppins_400Regular'}}>July, 12, 2025</Text>
      </View>
      
      <View className="flex-row gap-4 justify-center mt-4">

        <Link href={`/single-scan/${2}` } asChild>
          <TouchableOpacity 
            onPress={() => {}}
            className="bg-neutral-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
          >
            <MaterialIcons name="visibility" size={18} color="white" />
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>View</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity 
          onPress={() => {
            closeDialog();
          }}
          className="bg-red-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
        >
          <MaterialIcons name="delete" size={18} color="white" />
          <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>Delete</Text>
        </TouchableOpacity>
      </View>
      </Dialog>
    </SafeAreaView>
  );
}

