package com.github.ahaerdy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;
    private String etiqueta;

    @Enumerated(EnumType.STRING)
    private ColunaEnum coluna;

    public Card() {
    }

    public Card(String id, String titulo, String etiqueta, ColunaEnum coluna) {
        this.id = id;
        this.titulo = titulo;
        this.etiqueta = etiqueta;
        this.coluna = coluna;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public ColunaEnum getColuna() {
        return coluna;
    }

    public void setColuna(ColunaEnum coluna) {
        this.coluna = coluna;
    }
}