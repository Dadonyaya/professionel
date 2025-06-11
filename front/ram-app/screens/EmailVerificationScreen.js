import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { auth, BACKEND_URL } from '../firebase';
import axios from 'axios';

export default function EmailVerificationScreen({ navigation }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      await user.reload();

      if (user.emailVerified) {
        clearInterval(interval);
        const token = await user.getIdToken();
        await axios.post(`${BACKEND_URL}/api/users`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        navigation.replace('DrawerNav');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo RAM */}
      <Image source={require('../assets/logo_ram.png')} style={styles.logo} />

      {/* Titre */}
      <Text style={styles.title}>Vérifiez votre adresse e-mail</Text>

      {/* Message */}
      <Text style={styles.subtitle}>
        Un email de vérification vous a été envoyé.
        {'\n'}Veuillez cliquer sur le lien reçu avant de continuer.
      </Text>

      {/* Loader stylisé */}
      <ActivityIndicator size="small" color="#a3001b" style={styles.loader} />
      <Text style={styles.waiting}>En attente de confirmation...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#a3001b',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 10,
  },
  waiting: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
});
