package com.ram.bagagebackend.repository;

import com.ram.bagagebackend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByFirebaseUid(String firebaseUid);

    void deleteByFirebaseUid(String firebaseUid);

    // ✅ Ajout pour recherche par email sans tenir compte de la casse
    Optional<Utilisateur> findByEmailIgnoreCase(String email);
}
