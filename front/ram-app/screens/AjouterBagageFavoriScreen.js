import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, Keyboard, ScrollView, Platform,
  TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage as storage, auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

export default function AjouterBagageFavoriScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const ouvrirCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l’accès à la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const envoyerBagage = async () => {
    if (!nom || !description) {
      return Alert.alert('Champs requis', 'Remplis le nom et la description.');
    }

    setUploading(true);

    try {
      let photos = null;

      if (imageUri) {
        const blob = await (await fetch(imageUri)).blob();
        const imageRef = ref(storage, `bagagesFavoris/${uuidv4()}.jpg`);
        await uploadBytes(imageRef, blob);
        photos = await getDownloadURL(imageRef);
      }

      const token = await auth.currentUser.getIdToken();

      await axios.post(`${BACKEND_URL}/bagages-favoris`, {
        nom,
        description,
        photos,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Succès', 'Bagage favori ajouté !');
      navigation.goBack();
    } catch (err) {
      console.error('Erreur envoi bagage favori :', err.message);
      Alert.alert('Erreur', 'Impossible d’ajouter le bagage favori.');
    }

    setUploading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? '#121212' : '#f4f4f4' }
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#a3001b" />
        </TouchableOpacity>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Ajouter un bagage favori
        </Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
            color: isDark ? '#fff' : '#000'
          }]}
          placeholder="Nom"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={nom}
          onChangeText={setNom}
        />

        <TextInput
          style={[styles.textArea, {
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
            color: isDark ? '#fff' : '#000'
          }]}
          placeholder="Description"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#444' }]}>Photo (facultative)</Text>

        <View style={styles.photoSection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <TouchableOpacity style={styles.addImage} onPress={ouvrirCamera}>
              <Ionicons name="camera" size={30} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { opacity: uploading ? 0.6 : 1 }]}
          onPress={envoyerBagage}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.submitText}>
            {uploading ? 'Envoi en cours...' : 'Ajouter le bagage'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    flexGrow: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    elevation: 1,
  },
  textArea: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    elevation: 1,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  submitBtn: {
    backgroundColor: '#a3001b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
