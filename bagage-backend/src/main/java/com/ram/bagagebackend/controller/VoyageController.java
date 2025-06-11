package com.ram.bagagebackend.controller;

import com.google.firebase.auth.FirebaseToken;
import com.ram.bagagebackend.dto.VoyageDTO;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.entity.Voyage;
import com.ram.bagagebackend.repository.VoyageRepository;
import com.ram.bagagebackend.service.UtilisateurService;
import com.ram.bagagebackend.service.VoyageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/voyages")
@RequiredArgsConstructor
public class VoyageController {

    private final UtilisateurService utilisateurService;
    private final VoyageService voyageService;
    private final VoyageRepository voyageRepository;

    @Autowired
    private SseVolController sseVolController;

    private Utilisateur getCurrentUser() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        String firebaseUid = token.getUid();
        return utilisateurService.findByFirebaseUid(firebaseUid);
    }

    private boolean isStaff() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = token.getEmail();
        if (email == null) return false;
        email = email.toLowerCase();
        return email.startsWith("ram") || email.startsWith("admin123");
    }

    // ✅ GET /voyages (utilisateur connecté)
    @GetMapping
    public ResponseEntity<List<Voyage>> getMesVoyages() {
        Utilisateur user = getCurrentUser();
        return ResponseEntity.ok(voyageService.getVoyagesByUtilisateur(user));
    }

    // ✅ POST /voyages (utilisateur connecté)
    @PostMapping
    public ResponseEntity<Voyage> ajouterVoyage(@RequestBody VoyageDTO voyageDto) {
        Utilisateur user = getCurrentUser();
        Voyage voyage = voyageService.ajouterVoyagePourUtilisateur(voyageDto, user);
        return ResponseEntity.ok(voyage);
    }

    // ✅ GET /voyages/staff (accès staff uniquement)
    @GetMapping("/staff")
    public ResponseEntity<List<Voyage>> getAllVoyagesForStaff() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = token.getEmail();

        if (email == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        email = email.toLowerCase();

        if (!email.startsWith("ram") && !email.startsWith("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Voyage> voyages = voyageRepository.findAll();
        System.out.println("📦 STAFF : voyages récupérés = " + voyages.size());
        return ResponseEntity.ok(voyages);
    }

    // ✅ POST /voyages/staff (ajout par staff, notifie SSE)
    @PostMapping("/staff")
    public ResponseEntity<Voyage> ajouterVoyageStaff(@RequestBody VoyageDTO voyageDto) {
        if (!isStaff()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Voyage voyage = voyageService.ajouterVoyagePourStaff(voyageDto);

        // Notifier les clients SSE
        sseVolController.notifyClients(voyage);

        return ResponseEntity.ok(voyage);
    }

    // ✅ NOUVELLE ROUTE : Vérifie si un vol existe déjà (peu importe l’utilisateur)
    @GetMapping("/existe-global")
    public ResponseEntity<Boolean> existeVoyageGlobal(
            @RequestParam String pnr,
            @RequestParam String numeroVol) {
        boolean existe = voyageRepository.existsByPnrAndNumeroVol(pnr, numeroVol);
        return ResponseEntity.ok(existe);
    }
}
