import { Component } from '@angular/core';
import { Card } from './models/card';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  cards: Card[] = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional', coluna: 'A_FAZER' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos', coluna: 'A_FAZER' },
    { titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github', coluna: 'EM_ANDAMENTO' },
    { titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional', coluna: 'CONCLUIDO' },
  ];

  porColuna(coluna: Card['coluna']): Card[] {
    return this.cards.filter(c => c.coluna === coluna);
  }
}