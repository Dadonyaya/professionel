package com.ram.bagagebackend.controller;

import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.service.UtilisateurService;
import com.ram.bagagebackend.config.FirebaseUtils;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final FirebaseUtils firebaseUtils;

    @PostMapping
    public ResponseEntity<?> createOrGetUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            FirebaseToken firebaseToken = firebaseUtils.verifyToken(token);

            Utilisateur utilisateur = utilisateurService.getOrCreateUtilisateur(firebaseToken);
            return ResponseEntity.ok(utilisateur);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token Firebase invalide.");
        }
    }
}
