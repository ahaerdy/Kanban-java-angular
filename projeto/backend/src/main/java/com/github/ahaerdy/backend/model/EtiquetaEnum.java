package com.github.ahaerdy.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EtiquetaEnum {
    PROFISSIONAL("#7e57c2"),
    ESTUDOS("#43a047"),
    GITHUB("#29b6f6"),
    PRIORIDADE_ALTA("#e53935"),
    GEMINI("#fb8c00");

    private final String corHex;

    EtiquetaEnum(String corHex) {
        this.corHex = corHex;
    }

    public String getCorHex() {
        return corHex;
    }

    public String getName() {
        return name();
    }
}