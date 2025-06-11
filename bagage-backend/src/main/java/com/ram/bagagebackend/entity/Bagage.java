package com.ram.bagagebackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bagage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String description;

    @Lob
    private String photos; // JSON list de URLs

    @ManyToOne
    private Voyage voyage;

    @Enumerated(EnumType.STRING)
    private EtatSignalement etatSignalement = EtatSignalement.AUCUN;
}
