package com.github.ahaerdy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}

@RestController
class CardController {

	@GetMapping("/cards")
	public List<Map<String, String>> listar() {
		return List.of(
				Map.of("id", "1", "titulo", "Concluir E-commerce Portfolio", "etiqueta", "Profissional", "coluna", "A_FAZER"),
				Map.of("id", "2", "titulo", "Finalizar Debugging Design Patterns", "etiqueta", "Github", "coluna", "EM_ANDAMENTO")
		);
	}
}