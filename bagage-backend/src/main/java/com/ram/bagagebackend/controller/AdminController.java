package com.ram.bagagebackend.controller;

import com.google.firebase.auth.*;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;

    private boolean isAdmin() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof FirebaseToken token) {
            String email = token.getEmail();
            return email != null && email.equalsIgnoreCase("admin123@ram.com");
        }
        return false;
    }

    // 1. Lister tous les utilisateurs/staff
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() throws FirebaseAuthException {
        if (!isAdmin()) return ResponseEntity.status(403).body("Accès refusé");
        List<Map<String, Object>> all = new ArrayList<>();

        ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
        for (ExportedUserRecord user : page.iterateAll()) {
            Map<String, Object> info = new HashMap<>();
            info.put("uid", user.getUid());
            info.put("email", user.getEmail());
            info.put("type", (user.getEmail() != null && user.getEmail().toLowerCase().startsWith("ram")) ? "staff" : "user");

            // Ajouter nom/prenom/badge si dispo en BDD
            Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmailIgnoreCase(user.getEmail());
            utilisateurOpt.ifPresent(utilisateur -> {
                info.put("nom", utilisateur.getNom());
                info.put("prenom", utilisateur.getPrenom());
                info.put("badge", user.getEmail().split("@")[0]);
            });

            all.add(info);
        }
        return ResponseEntity.ok(all);
    }

    // 2. Créer un compte staff (Firebase + MySQL)
    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, String> payload) {
        if (!isAdmin()) return ResponseEntity.status(403).body("Accès refusé");

        String badge = payload.get("badge");
        String password = payload.get("password");
        String nom = payload.get("nom");
        String prenom = payload.get("prenom");

        if (badge == null || password == null) {
            return ResponseEntity.badRequest().body("Badge et mot de passe requis");
        }

        String email = badge.toLowerCase() + "@ram.com";
        try {
            UserRecord.CreateRequest req = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(prenom + " " + nom);

            UserRecord created = FirebaseAuth.getInstance().createUser(req);

            Utilisateur u = new Utilisateur();
            u.setFirebaseUid(created.getUid());
            u.setNom(nom);
            u.setPrenom(prenom);
            u.setEmail(email);
            utilisateurRepository.save(u);

            return ResponseEntity.ok(Map.of(
                    "uid", created.getUid(),
                    "email", created.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur création : " + e.getMessage());
        }
    }

    // 3. Supprimer un compte
    @DeleteMapping("/user/{uid}")
    public ResponseEntity<?> deleteUser(@PathVariable String uid) {
        if (!isAdmin()) return ResponseEntity.status(403).body("Accès refusé");
        try {
            utilisateurRepository.deleteByFirebaseUid(uid);
            FirebaseAuth.getInstance().deleteUser(uid);
            return ResponseEntity.ok("Supprimé !");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur suppression : " + e.getMessage());
        }
    }

    // ✅ 4. Obtenir nom + prénom par email
    @GetMapping("/nom-prenom")
    public ResponseEntity<Map<String, String>> getNomPrenomByEmail(@RequestParam String email) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Accès refusé"));
        }

        return utilisateurRepository.findByEmailIgnoreCase(email)
                .map(u -> Map.of("nom", u.getNom(), "prenom", u.getPrenom()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Utilisateur non trouvé")));
    }
}
