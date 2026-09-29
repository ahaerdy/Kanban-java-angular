package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Board;
import com.github.ahaerdy.backend.repository.BoardRepository;
import com.github.ahaerdy.backend.repository.CardRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;

    public BoardService(BoardRepository boardRepository, CardRepository cardRepository) {
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
    }

    @PostConstruct
    public void garantirBoardPadrao() {
        if (boardRepository.count() > 0) {
            return;
        }

        var padrao = new Board(UUID.randomUUID().toString(), "Meu Quadro");
        boardRepository.save(padrao);

        var orfaos = cardRepository.findByBoardIdIsNull();
        for (var card : orfaos) {
            card.setBoardId(padrao.getId());
            cardRepository.save(card);
        }
    }

    public List<Board> listarTodos() {
        return boardRepository.findAll();
    }

    public Board criar(String nome) {
        var novo = new Board(UUID.randomUUID().toString(), nome);
        return boardRepository.save(novo);
    }

    public void renomear(String id, String novoNome) {
        boardRepository.findById(id).ifPresent(b -> {
            b.setNome(novoNome);
            boardRepository.save(b);
        });
    }

    @Transactional
    public void excluir(String id) {
        cardRepository.deleteByBoardId(id);
        boardRepository.deleteById(id);
    }
}