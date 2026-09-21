package com.github.ahaerdy.backend.repository;

import com.github.ahaerdy.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, String> {
}