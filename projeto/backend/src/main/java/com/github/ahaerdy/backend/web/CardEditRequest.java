package com.github.ahaerdy.backend.web;

public record CardEditRequest(String titulo, String descricao, EtiquetaRequest etiqueta) {
}