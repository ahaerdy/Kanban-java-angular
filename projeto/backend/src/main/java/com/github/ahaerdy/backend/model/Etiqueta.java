package com.github.ahaerdy.backend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Etiqueta {

    private String nome;
    private String corHex;

    public Etiqueta() {
    }

    public Etiqueta(String nome, String corHex) {
        this.nome = nome;
        this.corHex = corHex;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCorHex() {
        return corHex;
    }

    public void setCorHex(String corHex) {
        this.corHex = corHex;
    }
}