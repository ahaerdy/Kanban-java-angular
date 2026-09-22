# Entendendo a Parte 5 do Angular para Desenvolvedores Backend

Nas etapas anteriores, estruturamos os dados do nosso quadro e otimizamos a filtragem com a interface `Card` e o método `porColuna()`. No entanto, o componente raiz (`App`) ainda acumulava duas responsabilidades distintas: orquestrar o quadro/colunas e definir os detalhes visuais internos de cada card.

A **Parte 5** do LOG realiza uma **refatoração estrutural** para aplicar o princípio de responsabilidade única, extraindo a exibição visual do card para um componente dedicado: o **`CardItemComponent`**.

---

## 1. Mapeamento de Conceitos (Java vs. Angular)

Para quem desenvolve em Java/Spring, a criação de componentes filhos e a comunicação entre eles equivale a modularizar partes da interface ou passar parâmetros entre classes:

| Conceito no Java / Backend | Equivalente na Parte 5 (Angular) | Função |
| :--- | :--- | :--- |
| **Componente de Visão / Fragmento** | **Componente Filho (`CardItemComponent`)** | Encapsula a marcação HTML e os estilos de um elemento específico da tela. |
| **Parâmetro de Método / Propriedade de DTO** | **`@Input()`** | Permite que o componente pai envie dados para o componente filho. |
| **Passagem de Parâmetro Obrigatório** | **`@Input({ required: true })`** | Garante em tempo de compilação que o componente filho receberá o dado necessário. |
| **Instauração de Sub-elemento (`<app-card-item>`)** | **Uso do Seletor com Property Binding (`[card]="c"`)** | Renderiza o componente filho dentro do template pai passando o objeto desejado. |

---

## 2. Cuidado com a Nomenclatura (Uma Pegadinha Importante!)

Ao criar componentes via Angular CLI (`ng generate component card`), a convenção padrão gera a classe sem sufixo, resultando no nome `Card`. 

No entanto, na Parte 4 nós já criamos a interface de domínio chamada `Card` (`src/app/models/card.ts`). Se o componente fosse nomeado como `Card`, haveria um **conflito direto de nomes** entre a classe visual e a interface de dados.

Por essa razão, o componente foi nomeado explicitamente como **`CardItemComponent`** no arquivo `card-item.ts`.

---

## 3. Passo 1: O Componente Filho (`src/app/card-item/...`)

O novo componente isola completamente a marcação visual e o estilo do card.

### TypeScript (`src/app/card-item/card-item.ts`):
```typescript
import { Component, Input } from '@angular/core';
import { Card } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
}
```

#### Explicação Didática:
1. **`@Input({ required: true }) card!: Card;`**
   * **`@Input()`**: Transforma a propriedade `card` em uma "porta de entrada", permitindo que o componente pai injete dados nela.
   * **`required: true`**: Torna a passagem desse parâmetro **obrigatória**. Se o componente pai tentar usar `<app-card-item>` sem passar a propriedade `[card]`, o compilador do Angular gerará um erro no build.
   * **`card!: Card`**: O operador `!` (*definite assignment assertion*) avisa ao compilador do TypeScript que essa propriedade será atribuída externamente pelo Angular no momento da renderização.

### HTML (`src/app/card-item/card-item.html`):
```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
</div>
```

### SCSS (`src/app/card-item/card-item.scss`):
```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
```

---

## 4. Passo 2: Atualização do Componente Pai (`src/app/...`)

Com a apresentação isolada no componente filho, o componente raiz (`App`) é simplificado e passa a apenas declarar a dependência e utilizar a nova tag customizada.

### TypeScript (`src/app/app.ts`):
```typescript
import { Component } from '@angular/core';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';

@Component({
  imports: [CardItemComponent],
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

#### Explicação Didática:
* **`imports: [CardItemComponent]`**: Em componentes *standalone* do Angular moderno, cada componente precisa declarar expressamente no array `imports` quais outros componentes ele utiliza dentro do seu próprio template.

### HTML (`src/app/app.html`):
```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    @for (c of porColuna('A_FAZER'); track c) {
      <app-card-item [card]="c" />
    }
  </div>

  <div class="column">
    <h2>Em Andamento</h2>
    @for (c of porColuna('EM_ANDAMENTO'); track c) {
      <app-card-item [card]="c" />
    }
  </div>

  <div class="column">
    <h2>Concluído</h2>
    @for (c of porColuna('CONCLUIDO'); track c) {
      <app-card-item [card]="c" />
    }
  </div>
</div>
```

#### Explicação Didática:
* **`<app-card-item [card]="c" />`**:
  * **`app-card-item`**: É o seletor HTML definido no `CardItemComponent`.
  * **`[card]="c"`**: É o **Property Binding**. Os colchetes `[card]` referenciam a propriedade `@Input() card` do filho, enquanto `"c"` passa o objeto atual da iteração do `@for`.

### SCSS (`src/app/app.scss`):
```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
```
*Note que as regras `.card` e `.tag` foram removidas do `app.scss`, pois agora residem exclusivamente em `card-item.scss`.*

---

## 5. Exercício Prático: Testando o Encapsulamento

Para comprovar que a responsabilidade visual está isolada no novo componente, realize o teste a seguir no seu ambiente:

### Passo 1: Crie a pasta do componente filho
Crie a pasta `src/app/card-item/` com os três arquivos: `card-item.ts`, `card-item.html` e `card-item.scss`.

### Passo 2: Altere apenas o estilo do card
Abra o arquivo `src/app/card-item/card-item.scss` e modifique a borda do `.card` (por exemplo, adicione uma borda esquerda colorida):

```scss
.card { 
  background: white; 
  border-radius: 6px; 
  padding: 0.75rem; 
  margin-bottom: 0.5rem; 
  box-shadow: 0 1px 2px rgba(0,0,0,.15); 
  border-left: 4px solid #7e57c2; /* Borda estilizada */
}
```

### Passo 3: Execute e Observe
Execute `ng serve` e observe a aplicação no navegador.
* **Resultado**: Todos os cards no quadro agora exibem a borda esquerda roxa.
* **Conclusão de Engenharia**: Alteramos o estilo visual de todos os cards sem tocar em uma única linha de `app.ts` ou `app.html`. O isolamento de responsabilidades foi concluído com sucesso!

---

