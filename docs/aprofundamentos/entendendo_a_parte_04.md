# Entendendo a Parte 4 do Angular para Desenvolvedores Backend

Na **Parte 3**, resolvemos a duplicação de dados criando um array de objetos no TypeScript. No entanto, duas limitações claras de engenharia foram identificadas:
1. **Falta de tipagem forte**: O array utilizava objetos literais sem um tipo nomeado, permitindo que qualquer estrutura de campos fosse atribuída inadvertidamente.
2. **Duplicação da lógica no HTML**: O template percorria o array três vezes inteiras e filtrava os itens com um bloco `@if` aninhado dentro do `@for` em cada coluna.

A **Parte 4** do LOG trata exatamente dessas duas limitações, introduzindo a **Interface `Card`** para criar um contrato rígido de dados e o método **`porColuna()`** para mover a lógica de filtragem da tela para a classe TypeScript.

---

## 1. Mapeamento de Conceitos (Java vs. TypeScript/Angular)

Para quem vem do ecossistema Java/Spring Boot, veja como esses novos recursos se traduzem:

| Conceito no Java (Backend) | Equivalente na Parte 4 (Angular) | Função |
| :--- | :--- | :--- |
| **`interface` / `record` / DTO** | **`interface Card`** | Define o formato/contrato do objeto (`titulo`, `etiqueta`, `coluna`). *Nota: Diferente do Java, a interface do TypeScript só existe em tempo de compilação e é eliminada no JavaScript final*. |
| **`enum ColunaEnum`** | **União de Literais de String** (`'A_FAZER' \| 'EM_ANDAMENTO' \| 'CONCLUIDO'`) | Restringe o valor do campo `coluna` a um conjunto fechado de constantes. |
| **`list.stream().filter(...)`** | **`Array.prototype.filter(...)`** | Filtra a coleção de cards retornando apenas os pertencentes a uma coluna específica. |

---

## 2. Passo 1: Criando o Contrato de Dados (`src/app/models/card.ts`)

A primeira evolução da Parte 4 é a criação de um tipo nomeado para o domínio do card.

Código do arquivo `src/app/models/card.ts`:

```typescript
export interface Card {
  titulo: string;
  etiqueta: string;
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}
```

### Explicação Didática:

* **`export interface Card`**: O `export` torna essa interface visível para outros arquivos da aplicação.
* **Tipagem de Atributos Básicos**: Os campos `titulo` e `etiqueta` são declarados estritamente como `string`.
* **União de Literais de String (`'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'`)**:
  * Em Java, você criaria um `enum` para limitar os valores possíveis de um estado.
  * Em TypeScript, este recurso é conhecido como **Union of String Literals**. Ele informa ao compilador que a variável `coluna` não aceita qualquer texto generico, mas **exclusivamente** um desses três valores literais. Se você tentar atribuir `'A_FASER'` (com erro de digitação), o código não compilará.

---

## 3. Passo 2: Tipando a Classe e Criando o Filtro (`src/app/app.ts`)

Com a interface criada, atualizamos a classe principal do componente.

Código de `src/app/app.ts`:

```typescript
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
```

### Explicação Didática:

1. **`import { Card } from './models/card';`**
   * Importa a interface que acabamos de definir.

2. **`cards: Card[] = [ ... ];`**
   * Agora o array é fortemente tipado como `Card[]`. O compilador TypeScript validará cada elemento do array no momento da compilação.

3. **`porColuna(coluna: Card['coluna']): Card[]`**
   * **Parâmetro `coluna: Card['coluna']`**: Significa que o parâmetro só aceita valores válidos do tipo `coluna` da interface `Card` (ou seja, só aceita `'A_FAZER'`, `'EM_ANDAMENTO'` ou `'CONCLUIDO'`).
   * **Retorno `Card[]`**: Declara que o método devolve uma nova lista contendo apenas os cards filtrados.
   * **`this.cards.filter(c => c.coluna === coluna)`**: O método `filter()` do JavaScript é equivalente ao `.stream().filter(...)` do Java, retornando um novo array com os elementos que atendem à condição.

---

## 4. Passo 3: Simplificando o Template HTML (`src/app/app.html`)

Graças ao método `porColuna()`, o HTML deixa de ter blocos condicionais `@if` internos para realizar filtragem.

Código de `src/app/app.html`:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    @for (c of porColuna('A_FAZER'); track c) {
      <div class="card">
        <span class="tag">{{ c.etiqueta }}</span>
        <strong>{{ c.titulo }}</strong>
      </div>
    }
  </div>

  <div class="column">
    <h2>Em Andamento</h2>
    @for (c of porColuna('EM_ANDAMENTO'); track c) {
      <div class="card">
        <span class="tag">{{ c.etiqueta }}</span>
        <strong>{{ c.titulo }}</strong>
      </div>
    }
  </div>

  <div class="column">
    <h2>Concluído</h2>
    @for (c of porColuna('CONCLUIDO'); track c) {
      <div class="card">
        <span class="tag">{{ c.etiqueta }}</span>
        <strong>{{ c.titulo }}</strong>
      </div>
    }
  </div>
</div>
```

### Explicação Didática:

* **Eliminação do `@if`**: Na Parte 3, o código tinha um `@for` no array completo e um `@if (c.coluna === 'A_FAZER')` interno. Agora, a própria expressão `@for (c of porColuna('A_FAZER'); track c)` já recebe o array previamente filtrado pelo TypeScript.
* **Reutilização de Código**: A lógica de filtragem foi centralizada no método `porColuna()` da classe, tornando o template limpo e focado estritamente na apresentação.

---

## 5. Exercício Prático: Testando a Segurança do TypeScript

Para vivenciar a vantagem da checagem de tipos estática trazida pela Parte 4, realize estes dois testes no seu código:

### Teste 1: Tente inserir um valor inválido na lista (Erro de Compilação)
No arquivo `src/app/app.ts`, adicione um novo card ao array com um erro proposital no nome da coluna (`'A_FAZER_ERRADO'`):

```typescript
cards: Card[] = [
  // ...
  { titulo: 'Testar validação do TypeScript', etiqueta: 'Estudos', coluna: 'A_FAZER_ERRADO' }
];
```

* **O que acontece?**
  Ao compilar com `ng serve` ou ao visualizar na sua IDE (VS Code / IntelliJ), o TypeScript imediatamente exibirá um erro vermelho informando:
  `Type '"A_FAZER_ERRADO"' is not assignable to type '"A_FAZER" | "EM_ANDAMENTO" | "CONCLUIDO"'`.
  Isso impede que erros de digitação passem despercebidos para a execução.

### Teste 2: Tente chamar `porColuna()` com um parâmetro inválido no HTML
No arquivo `src/app/app.html`, altere uma das chamadas para:

```html
@for (c of porColuna('COLUNA_INVALIDA'); track c) { ... }
```

* **O que acontece?**
  O compilador de templates do Angular (Angular Language Service) acusará um erro indicando que `'COLUNA_INVALIDA'` não é um argumento permitido pelo parâmetro `coluna: Card['coluna']`.

---

