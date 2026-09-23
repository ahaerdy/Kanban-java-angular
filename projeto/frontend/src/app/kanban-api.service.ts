import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card, CardEdicao } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/cards';

  listar() {
    return this.http.get<Card[]>(this.baseUrl);
  }

  criar(titulo: string) {
    return this.http.post<Card>(this.baseUrl, { titulo });
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