package com.ram.bagagebackend.repository;

import com.ram.bagagebackend.entity.Voyage;
import com.ram.bagagebackend.entity.Utilisateur;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoyageRepository extends JpaRepository<Voyage, Long> {

    List<Voyage> findByUtilisateur(Utilisateur utilisateur);

    // ✅ Ajout : vérifie si un vol avec ce PNR et numéro de vol existe (peu importe l'utilisateur)
    boolean existsByPnrAndNumeroVol(String pnr, String numeroVol);

    // 🔍 Recherche globale (PNR, numéro de vol, nom, prénom, départ ou arrivée)
    @org.springframework.data.jpa.repository.Query("""
            SELECT v FROM Voyage v
            WHERE lower(v.pnr) LIKE %:q%
               OR lower(v.numeroVol) LIKE %:q%
               OR lower(v.nom) LIKE %:q%
               OR lower(v.prenom) LIKE %:q%
               OR lower(v.villeDepart) LIKE %:q%
               OR lower(v.villeArrivee) LIKE %:q%
            """)
    Page<Voyage> search(@org.springframework.data.repository.query.Param("q") String q, Pageable pageable);

    @Override
    <S extends Voyage> Page<S> findAll(Example<S> example, Pageable pageable);
}
