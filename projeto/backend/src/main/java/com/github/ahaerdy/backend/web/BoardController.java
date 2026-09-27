package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Board;
import com.github.ahaerdy.backend.service.BoardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/boards")
public class BoardController {

    private final BoardService service;

    public BoardController(BoardService service) {
        this.service = service;
    }

    @GetMapping
    public List<Board> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Board criar(@RequestBody BoardCreateRequest body) {
        return service.criar(body.nome());
    }
}