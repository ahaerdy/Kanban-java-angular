package com.github.ahaerdy.backend.repository;

import com.github.ahaerdy.backend.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, String> {
}