package com.ram.bagagebackend.controller;

import com.google.firebase.auth.FirebaseToken;
import com.ram.bagagebackend.dto.BagageDto;
import com.ram.bagagebackend.entity.Bagage;
import com.ram.bagagebackend.entity.EtatSignalement;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.entity.Voyage;
import com.ram.bagagebackend.repository.BagageRepository;
import com.ram.bagagebackend.repository.VoyageRepository;
import com.ram.bagagebackend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/bagages")
@RequiredArgsConstructor
public class BagageController {

    private final BagageRepository bagageRepository;
    private final VoyageRepository voyageRepository;
    private final UtilisateurService utilisateurService;

    private Utilisateur getCurrentUser() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return utilisateurService.getOrCreateUtilisateur(token);
    }

    private boolean isStaff() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = token.getEmail();
        if (email == null) return false;
        email = email.toLowerCase();
        return email.startsWith("ram") || email.startsWith("admin");
    }

    // ✅ GET /bagages/voyage/{id}
    @GetMapping("/voyage/{id}")
    public ResponseEntity<List<Bagage>> getBagagesByVoyage(@PathVariable Long id) {
        Voyage voyage = voyageRepository.findById(id).orElse(null);
        if (voyage == null) return ResponseEntity.notFound().build();

        List<Bagage> bagages = bagageRepository.findByVoyage(voyage);
        return ResponseEntity.ok(bagages);
    }

    // ✅ STAFF ONLY: GET /bagages/staff/voyage/{id}
    @GetMapping("/staff/voyage/{id}")
    public ResponseEntity<List<Bagage>> getBagagesByVoyageStaff(@PathVariable Long id) {
        if (!isStaff()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Voyage voyage = voyageRepository.findById(id).orElse(null);
        if (voyage == null) return ResponseEntity.notFound().build();

        List<Bagage> bagages = bagageRepository.findByVoyage(voyage);
        return ResponseEntity.ok(bagages);
    }

    // ✅ STAFF ONLY: GET /bagages/staff/{id}
    @GetMapping("/staff/{id}")
    public ResponseEntity<Bagage> getBagageByIdStaff(@PathVariable Long id) {
        if (!isStaff()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return bagageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST /bagages
    @PostMapping
    public ResponseEntity<?> addBagage(@RequestBody BagageDto dto) {
        Voyage voyage = voyageRepository.findById(dto.getVoyageId()).orElse(null);
        if (voyage == null) return ResponseEntity.badRequest().body("Voyage introuvable");

        Bagage bagage = Bagage.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .photos(dto.getPhotos())
                .voyage(voyage)
                .etatSignalement(EtatSignalement.AUCUN)
                .build();

        Bagage saved = bagageRepository.save(bagage);
        return ResponseEntity.ok(saved);
    }

    // ✅ PUT /bagages/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Bagage> updateBagage(@PathVariable Long id, @RequestBody Bagage bagage) {
        return bagageRepository.findById(id)
                .map(existing -> {
                    existing.setNom(bagage.getNom());
                    existing.setDescription(bagage.getDescription());
                    existing.setPhotos(bagage.getPhotos());
                    Bagage updated = bagageRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ DELETE /bagages/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBagage(@PathVariable Long id) {
        if (!bagageRepository.existsById(id)) return ResponseEntity.notFound().build();
        bagageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ POST /bagages/{id}/signaler-perdu
    @PostMapping("/{id}/signaler-perdu")
    public ResponseEntity<?> signalerPerdu(@PathVariable Long id) {
        return bagageRepository.findById(id)
                .map(b -> {
                    b.setEtatSignalement(EtatSignalement.PERDU);
                    bagageRepository.save(b);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST /bagages/{id}/signaler-retrouve
    @PostMapping("/{id}/signaler-retrouve")
    public ResponseEntity<?> signalerRetrouve(@PathVariable Long id) {
        return bagageRepository.findById(id)
                .map(b -> {
                    b.setEtatSignalement(EtatSignalement.RETROUVE);
                    bagageRepository.save(b);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET /bagages/perdus (pour l’app mobile sol)
    @GetMapping("/perdus")
    public ResponseEntity<List<Bagage>> getBagagesPerdus() {
        List<Bagage> perdus = bagageRepository.findByEtatSignalement(EtatSignalement.PERDU);
        return ResponseEntity.ok(perdus);
    }
}
