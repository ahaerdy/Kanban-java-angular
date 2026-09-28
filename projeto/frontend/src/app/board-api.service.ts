import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board } from './models/board';

@Injectable({ providedIn: 'root' })
export class BoardApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/boards';

  listar() {
    return this.http.get<Board[]>(this.baseUrl);
  }

  criar(nome: string) {
    return this.http.post<Board>(this.baseUrl, { nome });
  }

  renomear(id: string, nome: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, { nome });
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}