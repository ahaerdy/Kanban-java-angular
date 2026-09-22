import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Card, CardEdicao } from '../models/card';

@Component({
  imports: [DragDropModule],
  selector: 'app-card-edit-modal',
  styleUrl: './card-edit-modal.scss',
  templateUrl: './card-edit-modal.html',
})
export class CardEditModalComponent implements OnInit {
  @Input({ required: true }) card!: Card;
  @Output() salvar = new EventEmitter<CardEdicao>();
  @Output() cancelar = new EventEmitter<void>();

  titulo = '';
  descricao = '';
  etiquetaNome = '';
  etiquetaCor = '';

  ngOnInit() {
    this.titulo = this.card.titulo;
    this.descricao = this.card.descricao ?? '';
    this.etiquetaNome = this.card.etiqueta?.nome ?? '';
    this.etiquetaCor = this.card.etiqueta?.corHex ?? '';
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