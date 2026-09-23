import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KanbanApiService } from './kanban-api.service';
import { Card, CardEdicao } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanStateService {
  private api = inject(KanbanApiService);
  private cardsSubject = new BehaviorSubject<Card[]>([]);
  readonly cards$ = this.cardsSubject.asObservable();

  carregar() {
    this.api.listar().subscribe(cards => this.cardsSubject.next(cards));
  }

  mover(id: string, coluna: string) {
    this.api.mover(id, coluna).subscribe(() => this.carregar());
  }

  criar(titulo: string, coluna: string) {
    this.api.criar(titulo, coluna).subscribe(() => this.carregar());
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