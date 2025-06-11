package com.ram.bagagebackend.dto;

import lombok.Data;

@Data
public class VoyageDTO {
    private String numeroVol;
    private String date;
    private String heure;
    private String destination;
    private String pnr;
    private String nom;
    private String prenom;
    private String villeDepart;
}
