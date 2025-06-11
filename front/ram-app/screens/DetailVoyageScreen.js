import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert,
  ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';
import { ThemeContext } from '../ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function DetailVoyageScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const route = useRoute();
  const navigation = useNavigation();
  const { voyage } = route.params;

  const [bagages, setBagages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBagageId, setSelectedBagageId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);

  const fetchBagages = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/bagages/voyage/${voyage.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBagages(res.data);
    } catch (error) {
      console.error("Erreur récupération bagages :", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBagages();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBagages();
    }, [])
  );

  const handleConfirmDelete = (id) => {
    setSelectedBagageId(id);
    setShowConfirmModal(true);
  };

  const supprimerBagage = async () => {
    setShowConfirmModal(false);
    if (!selectedBagageId) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BACKEND_URL}/bagages/${selectedBagageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBagages((prev) => prev.filter((b) => b.id !== selectedBagageId));
      Toast.show({
        type: 'success',
        text1: 'Bagage supprimé',
        position: 'bottom'
      });
    } catch (err) {
      console.error('Erreur suppression :', err.message);
      Alert.alert('Erreur', 'Impossible de supprimer ce bagage.');
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      onPress={() => handleConfirmDelete(id)}
      style={styles.deleteBtn}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Supprimer</Text>
    </TouchableOpacity>
  );

  const renderBagage = ({ item, index }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 80}
        useNativeDriver
        style={[styles.bagageCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
      >
        <Image
          source={{ uri: item.photos || 'https://via.placeholder.com/80x80.png?text=Image' }}
          style={styles.bagageImage}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.bagageTitle, { color: isDark ? '#fff' : '#000' }]}>{item.nom}</Text>
          <Text style={[styles.bagageDesc, { color: isDark ? '#ccc' : '#555' }]}>{item.description}</Text>
        </View>
      </Animatable.View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f4f4f4' }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#a3001b" />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>Détails du voyage</Text>

      <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#555' }]}>Vol :</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>{voyage.numeroVol}</Text>

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#555' }]}>Voyageur :</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>{voyage.prenom} {voyage.nom}</Text>

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#555' }]}>Itinéraire :</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>{voyage.villeDepart} ➔ {voyage.villeArrivee}</Text>

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#555' }]}>Date & Heure :</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>{voyage.date} à {voyage.heure}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Bagages</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#a3001b" style={{ marginTop: 20 }} />
      ) : bagages.length === 0 ? (
        <Text style={{ color: isDark ? '#aaa' : '#555', textAlign: 'center', marginTop: 20 }}>
          Aucun bagage ajouté.
        </Text>
      ) : (
        <FlatList
          data={bagages}
          renderItem={renderBagage}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddChoiceModal(true)}>
        <Ionicons name="add-circle-outline" size={20} color="white" />
        <Text style={styles.addText}>Ajouter un bagage</Text>
      </TouchableOpacity>

      {/* MODAL DE CONFIRMATION */}
      <Modal transparent visible={showConfirmModal} animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Text style={{ fontSize: 16, marginBottom: 10, color: isDark ? '#fff' : '#000' }}>
              Supprimer ce bagage ?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={{ marginRight: 20 }}>
                <Text style={{ color: '#777' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={supprimerBagage}>
                <Text style={{ color: '#a3001b', fontWeight: 'bold' }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL D’AJOUT */}
      <Modal transparent visible={showAddChoiceModal} animationType="fade" onRequestClose={() => setShowAddChoiceModal(false)}>
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="zoomIn"
            duration={300}
            easing="ease-out"
            useNativeDriver
            style={[styles.modalBox, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
          >
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAddChoiceModal(false)}>
              <Ionicons name="close" size={22} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, marginBottom: 18, color: isDark ? '#fff' : '#000', textAlign: 'center', fontWeight: '600' }}>
              Que voulez-vous faire ?
            </Text>
            <TouchableOpacity style={styles.choiceBtn} onPress={() => {
              setShowAddChoiceModal(false);
              navigation.navigate('AjouterBagage', { voyageId: voyage.id });
            }}>
              <Text style={styles.choiceText}>📷 Ajouter un nouveau bagage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.choiceBtn} onPress={() => {
              setShowAddChoiceModal(false);
              navigation.navigate('ChoisirBagageFavori', { voyageId: voyage.id });
            }}>
              <Text style={styles.choiceText}>⭐ Choisir un bagage favori</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { borderRadius: 12, padding: 16, marginBottom: 20, elevation: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  value: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  bagageCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 3 },
  bagageImage: { width: 80, height: 80, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#ddd' },
  bagageTitle: { fontSize: 16, fontWeight: 'bold' },
  bagageDesc: { fontSize: 13, marginTop: 2 },
  deleteBtn: { backgroundColor: '#a3001b', justifyContent: 'center', alignItems: 'center', width: 80, height: '90%', borderRadius: 10 },
  addButton: { backgroundColor: '#a3001b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 100, position: 'absolute', bottom: 20, right: 20, left: 20, elevation: 6 },
  addText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '85%', borderRadius: 12, padding: 22, position: 'relative' },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  choiceBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f0f0f0', marginBottom: 12 },
  choiceText: { fontSize: 15, color: '#333', textAlign: 'center' },
});
