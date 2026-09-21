package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.model.ColunaEnum;
import com.github.ahaerdy.backend.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KanbanService {

    private final CardRepository repository;

    public KanbanService(CardRepository repository) {
        this.repository = repository;
    }

    public List<Card> listarTodos() {
        return repository.findAll();
    }

    public Card criar(String titulo, String etiqueta) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, etiqueta, ColunaEnum.A_FAZER);
        return repository.save(novo);
    }

    public void mover(String id, ColunaEnum novaColuna) {
        repository.findById(id).ifPresent(c -> {
            c.setColuna(novaColuna);
            repository.save(c);
        });
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}