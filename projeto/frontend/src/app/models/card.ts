export interface Etiqueta {
  nome: string;
  corHex: string;
}

export interface Card {
  id: string;
  titulo: string;
  descricao: string | null;
  etiqueta: Etiqueta | null;
  ordem: number;
  boardId: string;
}

export interface CardEdicao {
  id: string;
  titulo: string;
  descricao: string | null;
  etiqueta: Etiqueta | null;
}