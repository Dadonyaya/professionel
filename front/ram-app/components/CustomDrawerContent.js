import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image
} from 'react-native';
import {
  DrawerContentScrollView, DrawerItem
} from '@react-navigation/drawer';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

export default function CustomDrawerContent(props) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await signOut(auth);
    props.navigation.replace('Login');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#181818' : '#fff' }
      ]}
    >
      {/* Header avec logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo_ram.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: isDark ? '#fff' : '#333' }]}>
          RAM Bagages
        </Text>
      </View>

      {/* Liens drawer personnalisés */}
      <View style={styles.drawerList}>
        <DrawerItem
          label={() => (
            <Text style={{ color: isDark ? '#aaa' : '#333', marginLeft: -10 }}>
              Mes Voyages
            </Text>
          )}
          onPress={() => props.navigation.navigate('Mes Voyages')}
          icon={({ color, size }) => (
            <Ionicons name="airplane-outline" size={size} color={color} />
          )}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: isDark ? '#aaa' : '#333', marginLeft: -10 }}>
              Mes Bagages
            </Text>
          )}
          onPress={() => props.navigation.navigate('Mes Bagages')}
          icon={({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          )}
        />
      </View>

      {/* Pied : thème + logout */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={isDark ? '#ffd700' : '#333'}
          />
          <Text style={[
            styles.footerText,
            { color: isDark ? '#ffd700' : '#333' }
          ]}>
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#a3001b" />
          <Text style={[styles.footerText, { color: '#a3001b', fontWeight: 'bold' }]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    marginLeft: 12,
    fontSize: 15,
  },
});