import { MyTopBar, MyTopBarHistory } from '@/components/MyTopBar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { StyleSheet, Image, Platform, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog } from 'react-native-ui-lib';


export default function TabTwoScreen() {

    const [isOpen, setIsOpen] = useState(false)
  
    const openDialog = () => {
      setIsOpen(true)
    }
  
    const closeDialog = () => {
      setIsOpen(false)
    }


  return (
    <SafeAreaView className='pt-7  flex-1 bg-[#010101]'>
      <MyTopBarHistory text='History' onPress={()=>router.push('/setting')}/>
      <ScrollView className='px-5 pt-8'>
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

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
