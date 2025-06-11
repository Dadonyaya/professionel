// ... [imports identiques]
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert,
  ActivityIndicator, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, firestore, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

export default function AjouterUnVolScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [volsTrouves, setVolsTrouves] = useState([]);
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  const rechercherVols = async () => {
    if (!pnr.trim()) return Alert.alert("Champ requis", "Veuillez entrer un PNR.");
    Keyboard.dismiss();
    setLoading(true);
    setVolsTrouves([]);
    setSelection([]);
    try {
      const q = query(
        collection(firestore, 'volsSimules'),
        where('pnr', '==', pnr.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);
      const rawResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const resultsWithStatus = await Promise.all(
        rawResults.map(async (vol) => {
          try {
            const res = await axios.get(`${BACKEND_URL}/voyages/existe-global`, {
              params: {
                pnr: vol.pnr,
                numeroVol: vol.numeroVol,
              }
            });
            return { ...vol, dejaAjoute: res.data };
          } catch (e) {
            console.error('Erreur vérif backend :', e.message);
            return { ...vol, dejaAjoute: false };
          }
        })
      );

      setTimeout(() => setVolsTrouves(resultsWithStatus), 150);
    } catch (error) {
      console.error('Erreur Firestore :', error.message);
      Alert.alert("Erreur", "Impossible de récupérer les vols.");
    }
    setLoading(false);
  };

  const toggleSelection = (vol) => {
    setSelection((prev) =>
      prev.some(v => v.id === vol.id)
        ? prev.filter(v => v.id !== vol.id)
        : [...prev, vol]
    );
  };

  const ajouterVols = async () => {
    setAjoutEnCours(true);
    try {
      const token = await auth.currentUser.getIdToken();
      for (const vol of selection) {
        await axios.post(`${BACKEND_URL}/voyages`, {
          numeroVol: vol.numeroVol,
          date: vol.date,
          destination: vol.destination,
          heure: vol.heure,
          pnr: vol.pnr,
          nom: vol.nom,
          prenom: vol.prenom,
          villeDepart: vol.villeDepart
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erreur ajout vol :', error.message);
      Alert.alert("Erreur", "Échec lors de l'ajout des vols.");
    }
    setAjoutEnCours(false);
  };

  const renderVol = ({ item, index }) => {
    const isSelected = selection.some(v => v.id === item.id);
    const estDesactive = item.dejaAjoute;

    return (
      <Animatable.View animation="fadeInUp" delay={index * 80} useNativeDriver>
        <TouchableOpacity
          onPress={() => !estDesactive && toggleSelection(item)}
          disabled={estDesactive}
          style={[
            styles.card,
            {
              backgroundColor: estDesactive
                ? (isDark ? '#2f2f2f' : '#e0e0e0')
                : isSelected
                  ? (isDark ? '#2c2c2c' : '#f0f4ff')
                  : (isDark ? '#1e1e1e' : '#fff'),
              borderColor: estDesactive ? '#aaa' : isSelected ? '#a3001b' : '#ddd',
              borderWidth: 1.2,
              opacity: estDesactive ? 0.6 : 1,
              position: 'relative',
            }
          ]}
        >
          {estDesactive && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Déjà ajouté</Text>
            </View>
          )}
          <View style={styles.cardRow}>
            <Ionicons name="airplane-outline" size={18} color={isDark ? '#ccc' : '#444'} />
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
              Vol {item.numeroVol}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={16} color={isDark ? '#aaa' : '#666'} />
            <Text style={styles.cardText}>
              {item.prenom} {item.nom}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={16} color={isDark ? '#aaa' : '#666'} />
            <Text style={styles.cardText}>
              {item.villeDepart} ➔ {item.destination}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={16} color={isDark ? '#aaa' : '#666'} />
            <Text style={styles.cardText}>Date : {item.date}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={16} color={isDark ? '#aaa' : '#666'} />
            <Text style={styles.cardText}>Heure : {item.heure}</Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#a3001b" />
          </TouchableOpacity>
          <Animatable.Text
            animation="fadeInDown"
            delay={80}
            style={[styles.title, { color: isDark ? '#fff' : '#222' }]}
          >
            Ajouter un vol
          </Animatable.Text>
        </View>

        <Animatable.View animation="fadeIn" delay={150} useNativeDriver>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="PNR"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={pnr}
            onChangeText={setPnr}
            autoCapitalize="characters"
            returnKeyType="done"
          />
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={250} useNativeDriver>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="Nom de famille"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="characters"
            returnKeyType="done"
          />
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={350} useNativeDriver>
          <TouchableOpacity style={styles.searchBtn} onPress={rechercherVols}>
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.searchText}>Rechercher</Text>
          </TouchableOpacity>
        </Animatable.View>

        {loading ? (
          <ActivityIndicator size="large" color={isDark ? '#87ceeb' : '#3366cc'} style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={volsTrouves}
            renderItem={renderVol}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {selection.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={300} useNativeDriver>
            <TouchableOpacity style={styles.addBtn} onPress={ajouterVols} disabled={ajoutEnCours}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.addText}>
                {ajoutEnCours
                  ? 'Ajout en cours...'
                  : selection.length === 1
                    ? 'Ajouter le vol'
                    : 'Ajouter les vols'
                }
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
    minHeight: 54,
  },
  backBtn: {
    marginRight: 12,
    marginTop: 3,
    padding: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  inputDark: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderColor: '#333',
  },
  inputLight: {
    backgroundColor: '#fff',
    color: '#000',
    borderColor: '#ccc',
  },
  searchBtn: {
    backgroundColor: '#a3001b',
    paddingVertical: 13,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cardText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#666',
  },
  addBtn: {
    backgroundColor: '#a3001b',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    backgroundColor: '#a3001b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
