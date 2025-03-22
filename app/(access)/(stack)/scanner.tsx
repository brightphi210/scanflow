import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Overlay } from "../../../components/Overlay";
import { useEffect, useRef } from "react";
import { SolidButtonArrowLeft } from "@/components/CustomButtons";
import Animated, { FadeInDown } from "react-native-reanimated";

 const Scanner = () =>  {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "ios" ? <StatusBar hidden /> : null}
        <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            zoom={0}
            ratio="16:9"
            onBarcodeScanned={({ data }) => {
                if (data && !qrLock.current) {
                qrLock.current = true;
                setTimeout(async () => {
                    await Linking.openURL(data);
                }, 500);
                }
            }}
        />
      <Overlay />

        <Animated.View className="w-[85%] mt-6 flex justify-center m-auto mb-14" entering={FadeInDown.duration(300).delay(200).springify()}>
            <SolidButtonArrowLeft text="Back" onPress={()=>router.back()}/>
      </Animated.View>
    </SafeAreaView>
  );
}

export default Scanner