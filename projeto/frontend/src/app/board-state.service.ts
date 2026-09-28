import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardApiService } from './board-api.service';
import { Board } from './models/board';

@Injectable({ providedIn: 'root' })
export class BoardStateService {
  private api = inject(BoardApiService);

  private boardsSubject = new BehaviorSubject<Board[]>([]);
  readonly boards$ = this.boardsSubject.asObservable();

  private boardAtualSubject = new BehaviorSubject<Board | null>(null);
  readonly boardAtual$ = this.boardAtualSubject.asObservable();

  carregarBoards() {
    this.api.listar().subscribe(boards => {
      this.boardsSubject.next(boards);
      if (!this.boardAtualSubject.value && boards.length > 0) {
        this.selecionar(boards[0]);
      }
    });
  }

  selecionar(board: Board) {
    this.boardAtualSubject.next(board);
  }

  criar(nome: string) {
    this.api.criar(nome).subscribe(novo => {
      this.boardsSubject.next([...this.boardsSubject.value, novo]);
      this.selecionar(novo);
    });
  }

  renomear(id: string, novoNome: string) {
    this.api.renomear(id, novoNome).subscribe(() => {
      const atualizados = this.boardsSubject.value.map(b => (b.id === id ? { ...b, nome: novoNome } : b));
      this.boardsSubject.next(atualizados);

      const atual = this.boardAtualSubject.value;
      if (atual?.id === id) {
        this.boardAtualSubject.next({ ...atual, nome: novoNome });
      }
    });
  }

  excluir(id: string) {
    this.api.excluir(id).subscribe(() => {
      const restantes = this.boardsSubject.value.filter(b => b.id !== id);
      this.boardsSubject.next(restantes);

      const atual = this.boardAtualSubject.value;
      if (atual?.id === id) {
        this.boardAtualSubject.next(restantes.length > 0 ? restantes[0] : null);
      }
    });
  }
}