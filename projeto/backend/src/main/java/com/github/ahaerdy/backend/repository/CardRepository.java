package com.github.ahaerdy.backend.repository;

import com.github.ahaerdy.backend.model.Card;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, String> {

    List<Card> findByBoardId(String boardId, Sort sort);

    List<Card> findByBoardIdIsNull();
}