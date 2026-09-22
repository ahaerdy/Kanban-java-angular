import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, CardEdicao } from '../models/card';
import { CardEditModalComponent } from '../card-edit-modal/card-edit-modal';

@Component({
  imports: [CardEditModalComponent],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
  @Output() remover = new EventEmitter<Card>();
  @Output() editar = new EventEmitter<CardEdicao>();

  editando = false;

  salvar(edicao: CardEdicao) {
    this.editando = false;
    this.editar.emit(edicao);
  }
}