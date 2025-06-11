package com.ram.bagagebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voyage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroVol;
    private LocalDate date;
    private String heure;
    private String pnr;
    private String villeDepart;
    private String villeArrivee;
    private String prenom;
    private String Nom;

    @ManyToOne
    private Utilisateur utilisateur;
}
