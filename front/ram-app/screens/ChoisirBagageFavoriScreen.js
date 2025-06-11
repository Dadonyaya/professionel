import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';

export default function ChoisirBagageFavoriScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  const { voyageId } = route.params;

  const [bagagesFavoris, setBagagesFavoris] = useState([]);
  const [filteredBagages, setFilteredBagages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBagagesFavoris = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/bagages-favoris`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBagagesFavoris(res.data);
      setFilteredBagages(res.data);
    } catch (err) {
      console.error('Erreur fetch favoris :', err.message);
      Alert.alert("Erreur", "Impossible de charger les bagages favoris.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBagagesFavoris();
  }, []);

  const handleAdd = async () => {
    const selected = bagagesFavoris.find(b => b.id === selectedId);
    if (!selected) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${BACKEND_URL}/bagages`, {
        nom: selected.nom,
        description: selected.description,
        photos: selected.photos,
        voyageId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Succès', 'Bagage favori ajouté au voyage.');
      navigation.goBack();
    } catch (err) {
      console.error('Erreur ajout :', err.message);
      Alert.alert('Erreur', 'Impossible d’ajouter ce bagage.');
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = bagagesFavoris.filter(b =>
      b.nom.toLowerCase().includes(text.toLowerCase()) ||
      b.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBagages(filtered);
  };

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? '#a3001b' : isDark ? '#1e1e1e' : '#fff',
            borderColor: isSelected ? '#a3001b' : '#e0e0e0',
            shadowOpacity: isSelected ? 0.3 : 0.1
          }
        ]}
        onPress={() => setSelectedId(item.id)}
      >
        <Image source={{ uri: item.photos }} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.nom, { color: isSelected ? '#fff' : isDark ? '#fff' : '#000' }]}>
            {item.nom}
          </Text>
          <Text style={[styles.desc, { color: isSelected ? '#eee' : isDark ? '#ccc' : '#666' }]}>
            {item.description}
          </Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f2f2f2' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Choisir un bagage favori
      </Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un bagage..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a3001b" style={{ marginTop: 30 }} />
      ) : filteredBagages.length === 0 ? (
        <Text style={{ textAlign: 'center', color: isDark ? '#aaa' : '#555', marginTop: 30 }}>
          Aucun bagage favori trouvé.
        </Text>
      ) : (
        <FlatList
          data={filteredBagages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        />
      )}

      {selectedId && (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="checkmark-outline" size={20} color="#fff" />
          <Text style={styles.addText}>Ajouter ce bagage au voyage</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  nom: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: '#a3001b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 5,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});
