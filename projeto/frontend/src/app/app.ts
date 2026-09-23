import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card, CardEdicao } from './models/card';
import { CardItemComponent } from './card-item/card-item';
import { CardCountComponent } from './card-count/card-count';
import { CardEditModalComponent } from './card-edit-modal/card-edit-modal';
import { KanbanStateService } from './kanban-state.service';

interface CardApi extends Card {
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

const COLUNA_POR_ID: Record<string, 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'> = {
  aFazer: 'A_FAZER',
  emAndamento: 'EM_ANDAMENTO',
  concluido: 'CONCLUIDO',
};

@Component({
  imports: [CardItemComponent, DragDropModule, CardCountComponent, CardEditModalComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private state = inject(KanbanStateService);
  private cdr = inject(ChangeDetectorRef);

  aFazer: Card[] = [];
  emAndamento: Card[] = [];
  concluido: Card[] = [];

  cardEmEdicao: Card | null = null;

  ngOnInit() {
    this.state.cards$.subscribe(cards => {
      const todas = cards as CardApi[];
      this.aFazer = todas.filter(c => c.coluna === 'A_FAZER');
      this.emAndamento = todas.filter(c => c.coluna === 'EM_ANDAMENTO');
      this.concluido = todas.filter(c => c.coluna === 'CONCLUIDO');
      this.cdr.markForCheck();
    });
    this.state.carregar();
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.state.reordenar(event.container.data.map(c => c.id));
      return;
    }
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const novaColuna = COLUNA_POR_ID[event.container.id];
    this.state.mover(card.id, novaColuna);
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    this.state.criar(titulo);
  }

  abrirEdicao(card: Card) {
    this.cardEmEdicao = card;
  }

  salvarEdicao(edicao: CardEdicao) {
    this.cardEmEdicao = null;
    this.state.editar(edicao);
  }

  fecharEdicao() {
    this.cardEmEdicao = null;
  }

  remover(coluna: Card[], card: Card) {
    this.state.excluir(card.id);
  }
}