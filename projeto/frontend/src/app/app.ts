import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';
import { CardCountComponent } from './card-count/card-count';
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
  imports: [CardItemComponent, DragDropModule, CardCountComponent],
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

  remover(coluna: Card[], card: Card) {
    this.state.excluir(card.id);
  }
}