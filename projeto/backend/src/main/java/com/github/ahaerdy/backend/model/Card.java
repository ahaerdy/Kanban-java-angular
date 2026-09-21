package com.github.ahaerdy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;
    private String etiqueta;
    private String coluna;

    public Card() {
    }

    public Card(String id, String titulo, String etiqueta, String coluna) {
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

    public String getColuna() {
        return coluna;
    }

    public void setColuna(String coluna) {
        this.coluna = coluna;
    }
}