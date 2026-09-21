import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';
import { KanbanApiService } from './kanban-api.service';

interface CardApi extends Card {
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

const COLUNA_POR_ID: Record<string, 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'> = {
  aFazer: 'A_FAZER',
  emAndamento: 'EM_ANDAMENTO',
  concluido: 'CONCLUIDO',
};

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private api = inject(KanbanApiService);
  private cdr = inject(ChangeDetectorRef);

  aFazer: Card[] = [];
  emAndamento: Card[] = [];
  concluido: Card[] = [];

  ngOnInit() {
    this.api.listar().subscribe(cards => {
      const todas = cards as CardApi[];
      this.aFazer = todas.filter(c => c.coluna === 'A_FAZER');
      this.emAndamento = todas.filter(c => c.coluna === 'EM_ANDAMENTO');
      this.concluido = todas.filter(c => c.coluna === 'CONCLUIDO');
      this.cdr.markForCheck();
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const novaColuna = COLUNA_POR_ID[event.container.id];
    this.api.mover(card.id, novaColuna).subscribe();
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    this.api.criar(titulo, 'Geral').subscribe(novo => {
      coluna.push(novo);
      this.cdr.markForCheck();
    });
  }

  remover(coluna: Card[], card: Card) {
    this.api.excluir(card.id).subscribe(() => {
      const index = coluna.indexOf(card);
      if (index >= 0) coluna.splice(index, 1);
      this.cdr.markForCheck();
    });
  }
}
