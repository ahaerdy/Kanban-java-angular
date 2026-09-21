package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/cards")
public class CardController {

    private final KanbanService service;

    public CardController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public List<Card> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Card criar(@RequestBody Card novo) {
        return service.criar(novo.getTitulo(), novo.getEtiqueta());
    }

    @PutMapping("/{id}/coluna")
    public void mover(@PathVariable String id, @RequestBody Map<String, String> body) {
        service.mover(id, body.get("coluna"));
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}