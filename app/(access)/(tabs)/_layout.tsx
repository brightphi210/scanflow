import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => null,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          paddingTop: 5,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 100,
          borderColor: '#262626',
          borderWidth: 1,
          borderStyle: 'solid',
          height: 75,
          display: 'flex',
          marginHorizontal: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0E0E0E',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarIconStyle: {
          width: 48,
          height: 48,
        },
        tabBarItemStyle: {
          marginHorizontal: 15,
        },
        tabBarLabelStyle: {
          display: 'none'
        }
      }}>
       <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialIcons name='home-filled' size={28} color={ focused ? "#3D68FF": "white"} />
            </View>
          ),
        }}
      />


      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: '#3D68FF',
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialIcons name='qr-code-scanner' size={28} color="white" />
            </View>
          ),
        }}
      />


      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialIcons name='history' size={28} color={ focused ? "#3D68FF": "white"} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}