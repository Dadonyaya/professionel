import React, { useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function MesVoyagesScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const [vols, setVols] = useState([]);
  const [error, setError] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchVols = async () => {
    setFetched(false);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/voyages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVols(res.data);
      setError(false);
    } catch (err) {
      console.error('Erreur récupération vols :', err.message);
      setError(true);
    } finally {
      setFetched(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVols();
    }, [])
  );

  const renderVol = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} useNativeDriver>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
        onPress={() => navigation.navigate('DetailVoyage', { voyage: item })}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="airplane-outline" size={22} color={isDark ? '#87ceeb' : '#a3001b'} />
          <Text style={[styles.volNumber, { color: isDark ? '#fff' : '#000' }]}>
            Vol {item.numeroVol}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="person-outline" size={16} color={isDark ? '#ccc' : '#555'} />
          <Text style={[styles.info, { color: isDark ? '#ccc' : '#555' }]}>
            {item.prenom} {item.nom}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={16} color={isDark ? '#ccc' : '#555'} />
          <Text style={[styles.info, { color: isDark ? '#ccc' : '#555' }]}>
            {item.villeDepart} ➔ {item.villeArrivee}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={16} color={isDark ? '#ccc' : '#555'} />
          <Text style={[styles.info, { color: isDark ? '#ccc' : '#555' }]}>
            {item.date}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="time-outline" size={16} color={isDark ? '#ccc' : '#555'} />
          <Text style={[styles.info, { color: isDark ? '#ccc' : '#555' }]}>
            {item.heure}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f4f4f4' }]}>
      <Animatable.View animation="fadeInDown" duration={800}>
        <Text style={[styles.title, { color: isDark ? '#f5f5f5' : '#222' }]}>Welcome back</Text>
        <View style={[styles.underline, { backgroundColor: isDark ? '#fff' : '#a3001b' }]} />
      </Animatable.View>

      {!fetched ? (
        <Animatable.Text animation="fadeIn" delay={400} style={[styles.info, { color: isDark ? '#aaa' : '#777', textAlign: 'center' }]}>
          Chargement de vos vols...
        </Animatable.Text>
      ) : error ? (
        <Animatable.Text animation="fadeIn" delay={400} style={[styles.emptyText, { color: 'red' }]}>
          Erreur de connexion au serveur.
        </Animatable.Text>
      ) : vols.length === 0 ? (
        <Animatable.View animation="fadeIn" delay={400} style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#777' }]}>
            Vous n’avez ajouté aucun vol pour le moment.
          </Text>
        </Animatable.View>
      ) : (
        <FlatList
          data={vols}
          renderItem={renderVol}
          keyExtractor={(item) => item.id?.toString() ?? item.numeroVol + item.date}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => navigation.navigate('AjouterUnVol')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  underline: {
    width: 140,
    height: 3,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  volNumber: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a3001b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});
