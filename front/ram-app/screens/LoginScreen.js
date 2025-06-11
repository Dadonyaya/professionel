import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  TouchableOpacity, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      await axios.post(`${BACKEND_URL}/api/users`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigation.replace('DrawerNav');
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
          <Ionicons name="lock-closed-outline" size={38} color={isDark ? '#fff' : '#a3001b'} />
          <Text style={[styles.title, { color: isDark ? '#fff' : '#a3001b' }]}>
            Connexion
          </Text>
        </View>

        <View style={[styles.inputGroup, { borderBottomColor: isDark ? '#444' : '#ccc' }]}>
          <Ionicons name="mail-outline" size={20} color={isDark ? '#ccc' : '#555'} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.inputGroup, { borderBottomColor: isDark ? '#444' : '#ccc' }]}>
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
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color={isDark ? '#ccc' : '#555'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: isDark ? '#a3c9f9' : '#a3001b' }]}>
            Pas encore de compte ? <Text style={styles.linkBold}>S’inscrire</Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 8,
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
