package com.github.ahaerdy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Board {

    @Id
    private String id;
    private String nome;

    public Board() {
    }

    public Board(String id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}