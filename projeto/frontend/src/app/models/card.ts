export interface Etiqueta {
  name: string;
  corHex: string;
}

export interface Card {
  id: string;
  titulo: string;
  etiquetas: Etiqueta[];
}