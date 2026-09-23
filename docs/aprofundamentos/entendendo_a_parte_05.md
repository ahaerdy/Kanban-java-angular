# Entendendo a parte 5: Extração do Componente de Card (`CardItemComponent`)

## 1. O Problema da Parte 4 e a Motivação para a Mudança

Na **Parte 4**, resolvemos a tipagem estática com a interface `Card` e centralizamos a filtragem com o método `porColuna()`. No entanto, ao analisar a arquitetura sob a ótica de engenharia de software (muito comum no desenvolvimento backend em Java/Spring), identificou-se um problema claro de responsabilidade:

* **Violação do Princípio de Responsabilidade Única (SRP - Single Responsibility Principle)**: O componente principal (`App`) acumulava duas funções bem distintas: gerenciar a orquestração do quadro Kanban (colunas, posições) e definir a marcação HTML e as regras visuais CSS de cada card individual.
* **Duplicação de Código Visual**: No template `app.html`, o bloco HTML do card (`<div class="card">...</div>`) estava repetido manualmente dentro das 3 colunas.
* **Acoplamento de Estilos**: O arquivo `app.scss` misturava estilos do quadro (`.board`, `.column`) com estilos específicos do card (`.card`, `.tag`).

A **Parte 5** realiza uma **refatoração puramente estrutural**: não altera o comportamento visível para o usuário, mas isola a responsabilidade da representação visual do card em um **componente filho** (`CardItemComponent`).

---

## 2. Visão Geral das Alterações (Estrutura de Arquivos)

| Arquivo | Status na Parte 5 | Função / O que mudou |
| :--- | :--- | :--- |
| `src/app/models/card.ts` | **Sem alteração** | Mantém a interface `Card` criada na Parte 4. |
| `src/app/card-item/card-item.ts` | **Novo Arquivo** | Classe TypeScript do novo componente filho do card. |
| `src/app/card-item/card-item.html` | **Novo Arquivo** | Template HTML dedicado exclusivamente à estrutura do card. |
| `src/app/card-item/card-item.scss` | **Novo Arquivo** | Estilos CSS/SCSS isolados do card. |
| `src/app/app.ts` | **Alterado** | Importa e registra o `CardItemComponent` no seu array `imports`. |
| `src/app/app.html` | **Alterado** | Substitui a marcação manual do card pela tag `<app-card-item [card]="c" />`. |
| `src/app/app.scss` | **Alterado** | Remove as regras CSS `.card` e `.tag` que migraram para o filho. |

---

## 3. Os Novos Arquivos Criados na Parte 5

Para desacoplar a exibição do card, foi criada a pasta `src/app/card-item/` com três arquivos:

### ⚠️ Cuidados com a Nomenclatura (A Pegadinha de Nomes)
Ao gerar componentes via Angular CLI (`ng generate component card`), a convenção gera uma classe chamada `Card`. Como na Parte 4 já havíamos criado a interface de domínio `Card` (`src/app/models/card.ts`), haveria um **conflito direto de nomes** entre o modelo de dados e o componente visual. Por esse motivo, o componente foi nomeado explicitamente como **`CardItemComponent`**.

### 1. `src/app/card-item/card-item.ts` (Novo)
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
* **O que faz**:
  * `@Input({ required: true }) card!: Card;`: Declara uma propriedade de entrada recebida do componente pai. O `required: true` obriga o componente pai a fornecer o dado sob pena de erro em tempo de compilação, e o operador `!` informa ao TypeScript que o valor será injetado pelo Angular.

### 2. `src/app/card-item/card-item.html` (Novo)
```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
</div>
```
* **O que faz**: Contém a marcação visual de um único card, antes duplicada no `app.html`.

### 3. `src/app/card-item/card-item.scss` (Novo)
```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
```
* **O que faz**: Isolamento dos estilos visuais do card.

---

## 4. Comparação Lado a Lado dos Arquivos Alterados (Antes vs. Depois)

### 📄 1. `src/app/app.ts`

#### **ANTES (Parte 4)**
```typescript
import { Component } from '@angular/core';
import { Card } from './models/card';

@Component({
  imports: [], // ❌ Array vazio: não declarava dependências visuais externas
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  cards: Card[] = [ ... ];

  porColuna(coluna: Card['coluna']): Card[] {
    return this.cards.filter(c => c.coluna === coluna);
  }
}
```

#### **DEPOIS (Parte 5)**
```typescript
import { Component } from '@angular/core';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item'; // 🟢 1. Importa o novo componente

@Component({
  imports: [CardItemComponent], // 🟢 2. Declara o componente no array de imports
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  cards: Card[] = [ ... ];

  porColuna(coluna: Card['coluna']): Card[] {
    return this.cards.filter(c => c.coluna === coluna);
  }
}
```

* **O que mudou e Por quê?**
  * **Mudança**: Adicionou-se a importação `import { CardItemComponent }` e seu registro em `@Component({ imports: [CardItemComponent] })`.
  * **Motivo (Por quê)**: Nos componentes *standalone* do Angular moderno, cada componente precisa declarar de forma explícita quais outros componentes ele utiliza dentro de seu template.

---

### 📄 2. `src/app/app.html`

#### **ANTES (Parte 4)**
```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    @for (c of porColuna('A_FAZER'); track c) {
      <!-- ❌ Marcação inline do card duplicada em cada coluna -->
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

#### **DEPOIS (Parte 5)**
```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    @for (c of porColuna('A_FAZER'); track c) {
      <!-- 🟢 Delegação da renderização para o componente filho via tag e property binding -->
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

* **O que mudou e Por quê?**
  * **Mudança**: O bloco de marcação interna `<div class="card">...</div>` foi substituído pela tag `<app-card-item [card]="c" />`.
  * **Motivo (Por quê)**: 
    1. **Eliminação de Duplicação**: O template pai passa a se preocupar apenas com a estrutura das colunas, repassando o objeto `c` de cada iteração para o componente filho.
    2. **Property Binding `[card]="c"`**: Os colchetes `[card]` realizam a vinculação de dados, passando o card `c` do laço do pai para a propriedade `@Input() card` do filho.

---

### 📄 3. `src/app/app.scss`

#### **ANTES (Parte 4)**
```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }

/* ❌ Estilos visuais do card misturados no layout geral do quadro */
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
```

#### **DEPOIS (Parte 5)**
```scss
/* 🟢 Mantém estritamente as regras de layout do quadro e das colunas */
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
```

* **O que mudou e Por quê?**
  * **Mudança**: As regras `.card` e `.tag` foram removidas do `app.scss` e transferidas para `card-item.scss`.
  * **Motivo (Por quê)**: Encapsulamento de estilos. Ao escopar o CSS dentro do componente filho, garantimos que alterações no visual dos cards não causem vazamentos ou efeitos colaterais nos demais elementos da página.

---

## 5. Mapeamento de Conceitos (Visão do Desenvolvedor Backend)

| Conceito no Java / Spring | Equivalente no Angular (Parte 5) | O que faz |
| :--- | :--- | :--- |
| **Componente / Fragmento Reutilizável** | **`CardItemComponent`** | Encapsula marcação HTML e estilos CSS de uma entidade. |
| **Parâmetro de Método / Propriedade de DTO** | **`@Input({ required: true }) card!: Card`** | Recebe dados repassados pelo componente pai. |
| **Invocação com argumento** | **`<app-card-item [card]="c" />`** | Instancia o componente filho injetando a variável `c`. |

---

## 6. Exercício Prático: Testando o Isolamento

Para comprovar que o desacoplamento funcionou na prática:

1. Abra o arquivo do componente filho: `src/app/card-item/card-item.scss`.
2. Adicione uma borda colorida na esquerda da classe `.card`:
   ```scss
   .card {
     /* ...regras existentes... */
     border-left: 4px solid #7e57c2;
   }
   ```
3. Salve e observe a aplicação no navegador (`ng serve`).
* **Resultado**: Todos os cards exibirão a borda esquerda roxa.
* **Conclusão de Engenharia**: A alteração de design afeta todos os cards do sistema sem ter que modificar uma única linha de `app.ts` ou `app.html`.

