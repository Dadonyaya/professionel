package com.ram.bagagebackend.dto;

import lombok.Data;

@Data
public class BagageDto {
    private String nom;
    private String description;
    private String photos;
    private Long voyageId;
}
