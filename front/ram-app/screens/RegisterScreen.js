import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  TouchableOpacity, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${prenom} ${nom}`.trim(),
      });

      await sendEmailVerification(user);

      navigation.replace('EmailVerification');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>

        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'moon-outline' : 'sunny-outline'}
            size={24}
            color={isDark ? '#f9c74f' : '#a3001b'}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={38} color={isDark ? '#fff' : '#a3001b'} />
          <Text style={[styles.title, { color: isDark ? '#fff' : '#a3001b' }]}>
            Créer un compte
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.halfInputGroup, { marginRight: 8 }]}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#ccc' : '#555'} />
            <TextInput
              placeholder="Prénom"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              value={prenom}
              onChangeText={setPrenom}
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
            />
          </View>
          <View style={styles.halfInputGroup}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#ccc' : '#555'} />
            <TextInput
              placeholder="Nom"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              value={nom}
              onChangeText={setNom}
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color={isDark ? '#ccc' : '#555'} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="key-outline" size={20} color={isDark ? '#ccc' : '#555'} />
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color={isDark ? '#ccc' : '#555'} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="key-outline" size={20} color={isDark ? '#ccc' : '#555'} />
          <TextInput
            placeholder="Confirmer le mot de passe"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={22} color={isDark ? '#ccc' : '#555'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S’inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: isDark ? '#a3c9f9' : '#a3001b' }]}>
            Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  themeBtn: {
    position: 'absolute',
    top: 90,
    right: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  halfInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 6,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 24,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 6,
  },
  button: {
    backgroundColor: '#a3001b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
