package com.ram.bagagebackend.service;

import com.ram.bagagebackend.controller.SseVolController;
import com.ram.bagagebackend.dto.VoyageDTO;
import com.ram.bagagebackend.entity.Utilisateur;
import com.ram.bagagebackend.entity.Voyage;
import com.ram.bagagebackend.repository.VoyageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoyageService {

    private final VoyageRepository voyageRepository;
    private final SseVolController sseVolController; // Injection du SSE Controller

    public List<Voyage> getVoyagesByUtilisateur(Utilisateur utilisateur) {
        return voyageRepository.findByUtilisateur(utilisateur);
    }

    public Voyage ajouterVoyagePourUtilisateur(VoyageDTO dto, Utilisateur utilisateur) {
        Voyage voyage = new Voyage();
        voyage.setNumeroVol(dto.getNumeroVol());
        voyage.setDate(LocalDate.parse(dto.getDate()));
        voyage.setHeure(dto.getHeure());
        voyage.setVilleArrivee(dto.getDestination());
        voyage.setNom(dto.getNom());
        voyage.setPrenom(dto.getPrenom());
        voyage.setPnr(dto.getPnr());
        voyage.setUtilisateur(utilisateur);
        voyage.setVilleDepart(dto.getVilleDepart());
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        Voyage saved = voyageRepository.save(voyage);

        // Notifie tous les clients SSE (staff) qu'il y a un nouveau voyage
        sseVolController.notifyClients(saved);

        return saved;
    }

    // 🟢 Ajout STAFF (n’importe quel vol, sans utilisateur relié)
    public Voyage ajouterVoyagePourStaff(VoyageDTO dto) {
        Voyage voyage = new Voyage();
        voyage.setNumeroVol(dto.getNumeroVol());
        voyage.setDate(LocalDate.parse(dto.getDate()));
        voyage.setHeure(dto.getHeure());
        voyage.setVilleArrivee(dto.getDestination());
        voyage.setNom(dto.getNom());
        voyage.setPrenom(dto.getPrenom());
        voyage.setPnr(dto.getPnr());
        voyage.setUtilisateur(null); // Pas d'utilisateur relié
        voyage.setVilleDepart(dto.getVilleDepart());
        Voyage saved = voyageRepository.save(voyage);

        // Notifie tous les clients SSE (staff) pour ce nouvel ajout
        sseVolController.notifyClients(saved);

        return saved;
    }
}
