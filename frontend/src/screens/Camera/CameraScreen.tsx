import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styles } from "./styles";
import { useCamera } from "./useCamera";

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const { facing, toggleFacing, cameraRef, takePhoto, pickImageFromGallery } =
    useCamera((base64) => navigation.navigate("Analysis", { imageBase64: base64 }));

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="white" />
        <Text style={styles.permissionText}>
          Precisamos de acesso à câmera para analisar os alimentos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

        <View style={styles.topControls}>
          <TouchableOpacity onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.visorContainer}>
          <Ionicons name="scan-outline" size={250} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.visorText}>Centralize a embalagem ou alimento</Text>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={pickImageFromGallery}>
            <Ionicons name="image-outline" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterButtonOuter} onPress={takePhoto}>
            <View style={styles.shutterButtonInner} />
          </TouchableOpacity>

          <View style={{ width: 30 }} />
        </View>

      </CameraView>
    </View>
  );
}