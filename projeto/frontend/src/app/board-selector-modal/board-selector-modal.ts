import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild, inject } from '@angular/core';
import { BoardStateService } from '../board-state.service';
import { Board } from '../models/board';

@Component({
  imports: [],
  selector: 'app-board-selector-modal',
  styleUrl: './board-selector-modal.scss',
  templateUrl: './board-selector-modal.html',
})
export class BoardSelectorModalComponent implements OnInit {
  private boards = inject(BoardStateService);
  @Output() fechar = new EventEmitter<void>();

  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDivElement>;

  todosBoards: Board[] = [];
  boardSelecionadoId = '';
  renomeando = false;

  private arrastando = false;
  private offsetX = 0;
  private offsetY = 0;

  ngOnInit() {
    this.boards.boards$.subscribe(boards => {
      this.todosBoards = boards;
      if (!this.boardSelecionadoId && boards.length > 0) {
        this.boardSelecionadoId = boards[0].id;
      }
    });
    this.boards.boardAtual$.subscribe(atual => {
      if (atual) {
        this.boardSelecionadoId = atual.id;
      }
    });
  }

  get boardSelecionado(): Board | undefined {
    return this.todosBoards.find(b => b.id === this.boardSelecionadoId);
  }

  selecionarNaLista(id: string) {
    this.boardSelecionadoId = id;
    this.renomeando = false;
  }

  iniciarRenomeio() {
    if (this.boardSelecionado) {
      this.renomeando = true;
    }
  }

  confirmarRenomeio(novoNome: string) {
    const limpo = novoNome.trim();
    if (!limpo || !this.boardSelecionado) return;
    this.boards.renomear(this.boardSelecionado.id, limpo);
    this.renomeando = false;
  }

  abrir() {
    if (!this.boardSelecionado) return;
    this.boards.selecionar(this.boardSelecionado);
    this.fechar.emit();
  }

  criar(nome: string) {
    const limpo = nome.trim();
    if (!limpo) return;
    this.boards.criar(limpo);
    this.fechar.emit();
  }

  iniciarArraste(evento: MouseEvent) {
    const modal = this.modalRef.nativeElement;
    const retangulo = modal.getBoundingClientRect();

    modal.style.position = 'fixed';
    modal.style.margin = '0';
    modal.style.top = `${retangulo.top}px`;
    modal.style.left = `${retangulo.left}px`;

    this.arrastando = true;
    this.offsetX = evento.clientX - retangulo.left;
    this.offsetY = evento.clientY - retangulo.top;
    evento.preventDefault();
    evento.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  mover(evento: MouseEvent) {
    if (!this.arrastando) return;
    const modal = this.modalRef.nativeElement;
    modal.style.left = `${evento.clientX - this.offsetX}px`;
    modal.style.top = `${evento.clientY - this.offsetY}px`;
  }

  @HostListener('document:mouseup')
  pararArraste() {
    this.arrastando = false;
  }
}