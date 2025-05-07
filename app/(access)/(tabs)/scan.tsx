import { Image, StyleSheet, Platform, View, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BorderButton, BorderButtonDisable, SolidButton, SolidButtonDisable } from '@/components/CustomButtons';
import { router } from 'expo-router';
import {MyTopBar} from '@/components/MyTopBar';
import {useCameraPermissions} from 'expo-camera'
import { Link } from 'expo-router';

export default function ScanScreen() {

  const [permission, requestPermission] = useCameraPermissions()

  const isPermissionGranted = Boolean(permission?.granted)
  return (
    <SafeAreaView className='pt-7  flex-1 bg-[#010101]'>
      <MyTopBar text='Scan Smoothly' onPress={()=>router.push('/setting')}/>
      <View className='flex-1 justify-center items-center w-full '>
        <Animated.View className="" entering={FadeInDown.duration(300).springify()}>
          <Image
              source={require("../../../assets/images/scan.png")}
              alt="Scan flow Logo"
              style={{
              width: 220,
              height: 220,
              }}
          />
        </Animated.View>

        <Animated.View className="w-[70%]" entering={FadeInDown.duration(300).delay(200).springify()}>
            <Text className='text-neutral-400  mt-2 text-center text-sm' style={{fontFamily: 'Poppins_400Regular'}}>
                Enjoy seamless flow of reciept generator, with scanflow
            </Text>
        </Animated.View>

        {!isPermissionGranted ? 
          <Animated.View  className="w-[80%] mt-20 " entering={FadeInDown.duration(300).delay(400).springify()}>
            <BorderButton text='Request Permission' onPress={requestPermission}/>
          </Animated.View> :

          <Animated.View  className="w-[80%] mt-20 " entering={FadeInDown.duration(300).delay(400).springify()}>
            <BorderButtonDisable text='Request Permission'/>
          </Animated.View> 
        }

        {!isPermissionGranted ?
          <Animated.View className="w-[80%] mt-6" entering={FadeInDown.duration(300).delay(400).springify()}>
              <SolidButtonDisable text='Scan'/>
          </Animated.View> :

          <Animated.View className="w-[80%] mt-6" entering={FadeInDown.duration(300).delay(400).springify()}>
              <SolidButton text='Scan' onPress={() => router.push('/(access)/(stack)/scanner')}/>
          </Animated.View> 
        }

      </View>
    </SafeAreaView>
  );
}

