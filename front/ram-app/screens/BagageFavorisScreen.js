import React, { useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable';

export default function BagageFavorisScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const [bagages, setBagages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Pour relancer les animations

  const fetchBagagesFavoris = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/bagages-favoris`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBagages(res.data);
    } catch (error) {
      console.error('Erreur récupération bagages favoris :', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBagagesFavoris();
      setRefreshKey(prev => prev + 1); // Forcer rerender pour animations
    }, [])
  );

  const supprimerBagageFavori = async (id) => {
    Alert.alert(
      'Supprimer ce bagage ?',
      '',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await auth.currentUser.getIdToken();
              await axios.delete(`${BACKEND_URL}/bagages-favoris/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setBagages((prev) => prev.filter((b) => b.id !== id));
              Toast.show({ type: 'success', text1: 'Supprimé', position: 'bottom' });
            } catch (err) {
              console.error('Erreur suppression :', err.message);
              Alert.alert('Erreur', 'Impossible de supprimer le bagage favori.');
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (id) => (
    <TouchableOpacity onPress={() => supprimerBagageFavori(id)} style={styles.deleteBtn}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Supprimer</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        useNativeDriver
        style={[
          styles.card,
          { backgroundColor: isDark ? '#1e1e1e' : '#fff' }
        ]}
      >
        <Image
          source={{ uri: item.photos || 'https://via.placeholder.com/70x70.png?text=Image' }}
          style={styles.bagageImage}
        />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={[styles.cardDesc, { color: isDark ? '#ccc' : '#666' }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Animatable.View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f4f4f4' }]}>
      <Animatable.View animation="fadeInDown" duration={800}>
        <Text style={[styles.title, { color: isDark ? '#f5f5f5' : '#000' }]}>My Bags</Text>
        <View style={[styles.underline, { backgroundColor: isDark ? '#fff' : '#a3001b' }]} />
      </Animatable.View>

      {loading ? (
        <Animatable.Text animation="fadeIn" delay={400} style={[styles.emptyText, { color: isDark ? '#aaa' : '#777', textAlign: 'center' }]}>
          Chargement de vos bagages favoris...
        </Animatable.Text>
      ) : bagages.length === 0 ? (
        <Animatable.View animation="fadeIn" delay={400} style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#777' }]}>
            Vous n’avez ajouté aucun bagage favori pour le moment.
          </Text>
        </Animatable.View>
      ) : (
        <FlatList
          key={refreshKey}
          data={bagages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() ?? item.nom}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => navigation.navigate('AjouterBagageFavori')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <Toast />
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  bagageImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#ccc'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#a3001b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
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
