package com.ram.bagagebackend.repository;

import com.ram.bagagebackend.entity.Bagage;
import com.ram.bagagebackend.entity.EtatSignalement;
import com.ram.bagagebackend.entity.Voyage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BagageRepository extends JpaRepository<Bagage, Long> {
    List<Bagage> findByVoyage(Voyage voyage);
    List<Bagage> findByEtatSignalement(EtatSignalement etatSignalement);
}
