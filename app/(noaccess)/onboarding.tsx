import { SolidButtonArrow } from '@/components/CustomButtons'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {FadeInDown} from 'react-native-reanimated'
import { router } from 'expo-router'


const OnBoardingPage = () => {
  return (
    <SafeAreaView className='flex-1 flex flex-col justify-center items-center w-full'>
        <StatusBar style='light'/>

        <View className='flex-1 justify-center items-center w-full'>
            <Animated.View className="" entering={FadeInDown.duration(300).springify()}>
                <Image
                    source={require("../../assets/images/icon.png")}
                    alt="Scan flow Logo"
                    style={{
                    width: 130,
                    height: 130,
                    }}
                />
            </Animated.View>

            <Animated.View className="w-[75%]" entering={FadeInDown.duration(300).delay(200).springify()}>
                <Text className='text-white  mt-7 text-center text-xl' style={{fontFamily: 'Poppins_600SemiBold'}}>
                    Scan, Connect, Convert to PDF
                </Text>

                <Text className='text-neutral-400  mt-2 text-center text-sm' style={{fontFamily: 'Poppins_400Regular'}}>
                    Enjoy seamless flow of reciept generator, with scanflow
                </Text>
            </Animated.View>

            <Animated.View className="w-[80%] absolute bottom-20 " entering={FadeInDown.duration(300).delay(400).springify()}>
                <SolidButtonArrow text='Lets Start'  onPress={()=>router.replace('/home')}/>
            </Animated.View>
            
        </View>
    </SafeAreaView>
  )
}

export default OnBoardingPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010101",
    alignItems: "center",
    justifyContent: "center",
    width: '100%'
  },
});