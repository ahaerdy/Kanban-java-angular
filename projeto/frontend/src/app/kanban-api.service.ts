import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card, CardEdicao } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/cards';

  listar(boardId: string) {
    return this.http.get<Card[]>(`${this.baseUrl}?boardId=${boardId}`);
  }

  criar(titulo: string, coluna: string, boardId: string) {
    return this.http.post<Card>(this.baseUrl, { titulo, coluna, boardId });
  }

  mover(id: string, coluna: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/coluna`, { coluna });
  }

  editar(edicao: CardEdicao) {
    const { id, titulo, descricao, etiqueta } = edicao;
    return this.http.put<void>(`${this.baseUrl}/${id}`, { titulo, descricao, etiqueta });
  }

  reordenar(ids: string[]) {
    return this.http.put<void>(`${this.baseUrl}/reordenar`, { ids });
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}