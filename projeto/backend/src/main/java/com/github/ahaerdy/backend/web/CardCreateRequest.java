package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.ColunaEnum;

public record CardCreateRequest(String titulo, ColunaEnum coluna) {
}