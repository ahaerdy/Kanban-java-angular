import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BoardStateService } from '../board-state.service';
import { Board } from '../models/board';

@Component({
  imports: [AsyncPipe],
  selector: 'app-board-selector-modal',
  styleUrl: './board-selector-modal.scss',
  templateUrl: './board-selector-modal.html',
})
export class BoardSelectorModalComponent {
  private boards = inject(BoardStateService);
  @Output() fechar = new EventEmitter<void>();

  boards$ = this.boards.boards$;

  selecionar(board: Board) {
    this.boards.selecionar(board);
    this.fechar.emit();
  }

  criar(nome: string) {
    const limpo = nome.trim();
    if (!limpo) return;
    this.boards.criar(limpo);
    this.fechar.emit();
  }
}