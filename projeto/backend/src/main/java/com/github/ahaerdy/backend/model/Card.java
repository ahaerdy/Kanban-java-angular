package com.github.ahaerdy.backend.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;
    private String descricao;
    private long ordem = System.currentTimeMillis();

    @Enumerated(EnumType.STRING)
    private ColunaEnum coluna;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "nome", column = @Column(name = "etiqueta_nome")),
            @AttributeOverride(name = "corHex", column = @Column(name = "etiqueta_cor_hex"))
    })
    private Etiqueta etiqueta;

    public Card() {
    }

    public Card(String id, String titulo, ColunaEnum coluna) {
        this.id = id;
        this.titulo = titulo;
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public long getOrdem() {
        return ordem;
    }

    public void setOrdem(long ordem) {
        this.ordem = ordem;
    }

    public ColunaEnum getColuna() {
        return coluna;
    }

    public void setColuna(ColunaEnum coluna) {
        this.coluna = coluna;
    }

    public Etiqueta getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(Etiqueta etiqueta) {
        this.etiqueta = etiqueta;
    }
}