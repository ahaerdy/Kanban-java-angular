import { Component } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  aFazer: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional' },
    { id: crypto.randomUUID(), titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos' },
  ];
  emAndamento: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github' },
  ];
  concluido: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional' },
  ];

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    coluna.push({ id: crypto.randomUUID(), titulo, etiqueta: 'Geral' });
  }

  remover(coluna: Card[], card: Card) {
    const index = coluna.indexOf(card);
    if (index >= 0) coluna.splice(index, 1);
  }
}
