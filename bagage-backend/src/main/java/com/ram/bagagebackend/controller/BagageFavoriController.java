package com.ram.bagagebackend.controller;

import com.google.firebase.auth.FirebaseToken;
import com.ram.bagagebackend.entity.BagageFavori;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.repository.BagageFavoriRepository;
import com.ram.bagagebackend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bagages-favoris")
@RequiredArgsConstructor
public class BagageFavoriController {

    private final BagageFavoriRepository bagageFavoriRepository;
    private final UtilisateurService utilisateurService;

    private Utilisateur getCurrentUser() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return utilisateurService.getOrCreateUtilisateur(token);
    }

    // ✅ GET /bagages-favoris
    @GetMapping
    public ResponseEntity<List<BagageFavori>> getFavoris() {
        Utilisateur user = getCurrentUser();
        List<BagageFavori> favoris = bagageFavoriRepository.findByUtilisateur(user);
        return ResponseEntity.ok(favoris);
    }

    // ✅ POST /bagages-favoris
    @PostMapping
    public ResponseEntity<BagageFavori> addFavori(@RequestBody BagageFavori favori) {
        favori.setUtilisateur(getCurrentUser());
        BagageFavori saved = bagageFavoriRepository.save(favori);
        return ResponseEntity.ok(saved);
    }

    // ✅ PUT /bagages-favoris/{id}
    @PutMapping("/{id}")
    public ResponseEntity<BagageFavori> updateFavori(@PathVariable Long id, @RequestBody BagageFavori favori) {
        return bagageFavoriRepository.findById(id)
                .map(existing -> {
                    existing.setNom(favori.getNom());
                    existing.setDescription(favori.getDescription());
                    existing.setPhotos(favori.getPhotos());
                    BagageFavori updated = bagageFavoriRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ DELETE /bagages-favoris/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavori(@PathVariable Long id) {
        if (!bagageFavoriRepository.existsById(id)) return ResponseEntity.notFound().build();
        bagageFavoriRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
