import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KanbanApiService } from './kanban-api.service';
import { Card, CardEdicao } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanStateService {
  private api = inject(KanbanApiService);
  private cardsSubject = new BehaviorSubject<Card[]>([]);
  readonly cards$ = this.cardsSubject.asObservable();

  private boardId: string | null = null;

  selecionarBoard(boardId: string) {
    this.boardId = boardId;
    this.carregar();
  }

  carregar() {
    if (!this.boardId) return;
    this.api.listar(this.boardId).subscribe(cards => this.cardsSubject.next(cards));
  }

  mover(id: string, coluna: string) {
    this.api.mover(id, coluna).subscribe(() => this.carregar());
  }

  criar(titulo: string, coluna: string) {
    if (!this.boardId) return;
    this.api.criar(titulo, coluna, this.boardId).subscribe(() => this.carregar());
  }

  editar(edicao: CardEdicao) {
    this.api.editar(edicao).subscribe(() => this.carregar());
  }

  reordenar(ids: string[]) {
    this.api.reordenar(ids).subscribe(() => this.carregar());
  }

  excluir(id: string) {
    this.api.excluir(id).subscribe(() => this.carregar());
  }
}