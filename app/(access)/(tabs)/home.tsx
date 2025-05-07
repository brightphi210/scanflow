import { Image, StyleSheet, Platform, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SolidButtonArrow } from '@/components/CustomButtons';
import { Link, router } from 'expo-router';
import { MyTopBar } from '@/components/MyTopBar';
import { ScrollView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { getAllReceipts, deleteReceipt, initDatabase } from '@/components/utils/database';
import { Dialog } from 'react-native-ui-lib';

// Receipt interface definition
interface Receipt {
  id: number;
  employee: string;
  pos: string;
  total: string;
  paymentMethod: string;
  paymentAmount: string;
  dateTime: string;
  receiptNumber: string;
}

export default function HomeScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  useEffect(() => {
    // Initialize database and load receipts
    const setupDatabase = async () => {
      try {
        await initDatabase();
        await loadReceipts();
      } catch (error) {
        console.error('Error setting up database:', error);
      }
    };

    setupDatabase();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const allReceipts = await getAllReceipts();
      // Only show the most recent 3 receipts on home screen
      const recentReceipts = allReceipts.slice(0, 3) as Receipt[];
      setReceipts(recentReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (id: number) => {
    router.push(`/receipt/${id}`);
  };

  const openDeleteDialog = (id: number) => {
    setSelectedReceiptId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedReceiptId(null);
  };

  const confirmDeleteReceipt = async () => {
    if (selectedReceiptId === null) return;

    try {
      const success = await deleteReceipt(selectedReceiptId);
      if (success) {
        // Remove from local state
        setReceipts(receipts.filter(receipt => receipt.id !== selectedReceiptId));
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
    } finally {
      closeDeleteDialog();
    }
  };

  return (
    <SafeAreaView className='pt-7 flex-1 bg-[#010101]'>
      <MyTopBar text='👋 Hello Swifties' onPress={() => router.push('/setting')} />
      <ScrollView className='w-full mt-10 px-5' showsVerticalScrollIndicator={true}>
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

        <Animated.View className="mt-8" entering={FadeInDown.duration(300).delay(200).springify()}>
          <View className='flex flex-row'>
            <Text className='text-base text-neutral-400 text-left pb-2' style={{ fontFamily: 'Poppins_500Medium' }}>Recent Receipts</Text>
          </View>
          <View
            className='bg-neutral-950 flex flex-col h-[320px] rounded-2xl border-2 border-neutral-900 p-3'
          >
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-white" style={{ fontFamily: 'Poppins_400Regular' }}>Loading receipts...</Text>
              </View>
            ) : receipts.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <MaterialIcons name="receipt" size={40} color="#555" />
                <Text className="text-white text-lg mt-2" style={{ fontFamily: 'Poppins_400Regular' }}>No receipts found</Text>
                <Text className="text-neutral-400 text-center mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                  Scan a receipt QR code to get started
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                {receipts.map((receipt) => (
                  <TouchableOpacity
                    key={receipt.id}
                    onPress={() => handleViewReceipt(receipt.id)}
                    className="bg-neutral-800 p-4 rounded-lg mb-3 border border-neutral-700"
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-white text-lg">{receipt.total}</Text>
                        <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-neutral-400 mt-1 text-sm">Receipt #{receipt.receiptNumber}</Text>
                        <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-neutral-400 mt-1 text-sm">{receipt.dateTime}</Text>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => handleViewReceipt(receipt.id)}
                          className="bg-blue-600 p-3 rounded-2xl mr-2"
                        >
                          <MaterialIcons name="visibility" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openDeleteDialog(receipt.id)}
                          className="bg-orange-700 p-3 rounded-2xl"
                        >
                          <MaterialIcons name="delete" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                <SolidButtonArrow text='View More' onPress={() => router.push('/history')} />
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Dialog
        center
        visible={isDeleteDialogOpen}
        onDismiss={closeDeleteDialog}
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
          <Text className="text-white text-lg mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Delete Receipt</Text>
          <Text className="text-neutral-400 text-sm text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
            Are you sure you want to delete this receipt?
          </Text>
        </View>

        <View className="flex-row gap-4 justify-center mt-4">
          <TouchableOpacity
            onPress={closeDeleteDialog}
            className="bg-neutral-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
          >
            <MaterialIcons name="close" size={18} color="white" />
            <Text className="text-white text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmDeleteReceipt}
            className="bg-orange-700 py-3 px-6 rounded-xl flex-row gap-2 items-center"
          >
            <MaterialIcons name="delete" size={18} color="white" />
            <Text className="text-white text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    </SafeAreaView>
  );
}