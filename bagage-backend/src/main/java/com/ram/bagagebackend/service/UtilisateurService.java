package com.ram.bagagebackend.service;

import com.google.firebase.auth.FirebaseToken;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public Utilisateur getOrCreateUtilisateur(FirebaseToken token) {
        return utilisateurRepository.findByFirebaseUid(token.getUid()).orElseGet(() -> {
            Utilisateur user = Utilisateur.builder()
                    .firebaseUid(token.getUid())
                    .email(token.getEmail())
                    .nom(token.getName() != null ? token.getName().split(" ")[0] : "")
                    .prenom(token.getName() != null && token.getName().split(" ").length > 1 ? token.getName().split(" ")[1] : "")
                    .build();
            return utilisateurRepository.save(user);
        });
    }

    public Utilisateur findByFirebaseUid(String firebaseUid) {
        return utilisateurRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec firebaseUid"));
    }
}
