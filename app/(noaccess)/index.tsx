import { ActivityIndicator, StyleSheet, View, Image } from "react-native";
import React from "react";

const MainHomePage = () => {
  
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        alt="Scan flow Logo"
        style={{
          width: 150,
          height: 150,
          marginBottom: 25
        }}
      />
      <ActivityIndicator
        size={45}
        animating={true}
        color={'white'}
      />
    </View>
  );
};

export default MainHomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010101",
    alignItems: "center",
    justifyContent: "center",
  },
});
