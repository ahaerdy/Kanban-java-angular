import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Card, CardEdicao } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-edit-modal',
  styleUrl: './card-edit-modal.scss',
  templateUrl: './card-edit-modal.html',
})
export class CardEditModalComponent implements OnInit {
  @Input({ required: true }) card!: Card;
  @Output() salvar = new EventEmitter<CardEdicao>();
  @Output() cancelar = new EventEmitter<void>();

  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDivElement>;

  titulo = '';
  descricao = '';
  etiquetaNome = '';
  etiquetaCor = '';

  private arrastando = false;
  private offsetX = 0;
  private offsetY = 0;

  ngOnInit() {
    this.titulo = this.card.titulo;
    this.descricao = this.card.descricao ?? '';
    this.etiquetaNome = this.card.etiqueta?.nome ?? '';
    this.etiquetaCor = this.card.etiqueta?.corHex ?? '';
  }

  iniciarArraste(evento: MouseEvent) {
    const modal = this.modalRef.nativeElement;
    const retangulo = modal.getBoundingClientRect();

    // Sai do fluxo centralizado do flexbox e passa a se posicionar
    // por coordenadas fixas de tela, a partir da posição atual.
    modal.style.position = 'fixed';
    modal.style.margin = '0';
    modal.style.top = `${retangulo.top}px`;
    modal.style.left = `${retangulo.left}px`;

    this.arrastando = true;
    this.offsetX = evento.clientX - retangulo.left;
    this.offsetY = evento.clientY - retangulo.top;
    evento.preventDefault();
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

  confirmar(titulo: string, etiquetaNome: string, etiquetaCor: string, descricao: string) {
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) return;

    const nome = etiquetaNome.trim();
    this.salvar.emit({
      id: this.card.id,
      titulo: tituloLimpo,
      descricao: descricao.trim() || null,
      etiqueta: nome ? { nome, corHex: etiquetaCor.trim() || '#999999' } : null,
    });
  }
}