package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.model.Etiqueta;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return service.criar(novo.getTitulo());
    }

    @PutMapping("/{id}/coluna")
    public void mover(@PathVariable String id, @RequestBody ColunaRequest body) {
        service.mover(id, body.coluna());
    }

    @PutMapping("/{id}")
    public void editar(@PathVariable String id, @RequestBody CardEditRequest body) {
        Etiqueta etiqueta = body.etiqueta() != null
                ? new Etiqueta(body.etiqueta().nome(), body.etiqueta().corHex())
                : null;
        service.editar(id, body.titulo(), body.descricao(), etiqueta);
    }

    @PutMapping("/reordenar")
    public void reordenar(@RequestBody ReordenarRequest body) {
        service.reordenar(body.ids());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}