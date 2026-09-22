export interface Card {
  titulo: string;
  etiqueta: string;
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}