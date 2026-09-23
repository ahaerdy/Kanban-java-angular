package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.model.ColunaEnum;
import com.github.ahaerdy.backend.model.Etiqueta;
import com.github.ahaerdy.backend.repository.CardRepository;
import org.springframework.data.domain.Sort;
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
        return repository.findAll(Sort.by("ordem"));
    }

    public Card criar(String titulo) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, ColunaEnum.A_FAZER);
        return repository.save(novo);
    }

    public void mover(String id, ColunaEnum novaColuna) {
        repository.findById(id).ifPresent(c -> {
            c.setColuna(novaColuna);
            c.setOrdem(System.currentTimeMillis());
            repository.save(c);
        });
    }

    public void editar(String id, String titulo, String descricao, Etiqueta etiqueta) {
        repository.findById(id).ifPresent(c -> {
            c.setTitulo(titulo);
            c.setDescricao(descricao);
            c.setEtiqueta(etiqueta);
            repository.save(c);
        });
    }

    public void reordenar(List<String> ids) {
        for (int i = 0; i < ids.size(); i++) {
            long posicao = i;
            String id = ids.get(i);
            repository.findById(id).ifPresent(c -> {
                c.setOrdem(posicao);
                repository.save(c);
            });
        }
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}