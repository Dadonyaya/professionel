package com.ram.bagagebackend.repository;

import com.ram.bagagebackend.entity.BagageFavori;
import com.ram.bagagebackend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BagageFavoriRepository extends JpaRepository<BagageFavori, Long> {
    List<BagageFavori> findByUtilisateur(Utilisateur utilisateur);
}
