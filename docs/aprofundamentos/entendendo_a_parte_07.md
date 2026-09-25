# Criação e Remoção de Cards, e Introdução do Identificador Único (UUID)

## 1. O Problema da Parte 6 e a Motivação para a Mudança na Parte 7

Na **Parte 6**, adicionamos a interatividade de arrastar e soltar tarefas entre as colunas utilizando o Angular CDK. No entanto, a aplicação ainda tinha duas limitações práticas severas:
1. **Incapacidade de criar ou excluir tarefas**: Não existiam campos de entrada de texto ou botões para adicionar novos cards nem para remover os existentes pela interface.
2. **Ausência de Identificador Único (Primary Key)**: A remoção de um item exige identificar de forma inequívoca qual card deve ser excluído. Fazer essa busca por título é falho e perigoso, pois dois cards distintos podem ter exatamente o mesmo título.

A **Parte 7** resolve ambas as limitações introduzindo o campo `id` gerado via **UUID** nativo, a emissão de eventos do componente filho para o pai com **`@Output()`**, e campos de entrada de texto com **variáveis de referência de template (`#nome`)** para a criação dinâmica de cards.

---

## 2. Visão Geral das Alterações (Estrutura de Arquivos)

| Arquivo | Status na Parte 7 | O que mudou e Por quê? |
| :--- | :--- | :--- |
| `src/app/models/card.ts` | **Alterado** | Recebe o campo obrigatório `id: string`. |
| `src/app/card-item/card-item.ts` | **Alterado** | Adiciona o decorator `@Output() remover = new EventEmitter<Card>()`. |
| `src/app/card-item/card-item.html` | **Alterado** | Adiciona o botão de exclusão `<button class="remover" (click)="remover.emit(card)">×</button>`. |
| `src/app/card-item/card-item.scss` | **Alterado** | Adiciona posicionamento relativo ao `.card` e estilização do botão `.remover`. |
| `src/app/app.ts` | **Alterado** | Inicializa os cards com `crypto.randomUUID()`, cria os métodos `adicionar()` e `remover()`. |
| `src/app/app.html` | **Alterado** | Atualiza o laço para `track c.id`, vincula o evento `(remover)` e adiciona campos de entrada com `#referencia`. |
| `src/app/app.scss` | **Alterado** | Adiciona estilos para o formulário inline de nova tarefa (`.nova-tarefa`). |

---

## 3. Mapeamento de Conceitos (Java / Backend vs. Angular)

Para desenvolvedores backend:

| Conceito no Java / Spring Boot | Equivalente no Angular (Parte 7) | Função |
| :--- | :--- | :--- |
| **`UUID.randomUUID().toString()`** | **`crypto.randomUUID()`** | Gera um identificador único universal de 128 bits (versão 4) nativo do navegador. |
| **Chave Primária (`@Id`)** | **`id: string` + `track c.id`** | Fornece identidade estável para o rastreamento e manipulação dos elementos. |
| **Event Listener / Callback / Listener Interface** | **`@Output() remover = new EventEmitter<Card>()`** | Permite ao componente filho notificar o pai sobre uma ação do usuário. |
| **Parâmetro de Requisição / DTO no Controller** | **`$event` no template** | Carrega os dados emitidos pelo evento customizado do componente filho. |
| **Atribuição de Campo / Referência de Componente** | **Variável de referência de template (`#novoTitulo`)** | Referencia um elemento HTML diretamente no template sem declarar propriedades na classe. |

---

## 4. Comparação Lado a Lado das Alterações (Parte 6 vs. Parte 7)

### 📄 1. `src/app/models/card.ts`

#### **ANTES (Parte 6)**
```typescript
export interface Card {
  // ❌ Sem identificador único
  titulo: string;
  etiqueta: string;
}
```

#### **DEPOIS (Parte 7)**
```typescript
export interface Card {
  id: string; // 🟢 1. Identificador único obrigatório
  titulo: string;
  etiqueta: string;
}
```
* **Por que mudou?** Garantir que cada card possua uma chave primária estável (`id`), evitando colisões caso dois cards possuam o mesmo título.

---

### 📄 2. `src/app/card-item/card-item.ts` e `card-item.html`

#### **ANTES (Parte 6 - `card-item.ts`)**
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

#### **DEPOIS (Parte 7 - `card-item.ts`)**
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core'; // 🟢 Importa EventEmitter e Output
import { Card } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
  @Output() remover = new EventEmitter<Card>(); // 🟢 Declara o evento de saída customizado
}
```

#### **ANTES (Parte 6 - `card-item.html`)**
```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
</div>
```

#### **DEPOIS (Parte 7 - `card-item.html`)**
```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
  <!-- 🟢 Botão de exclusão que dispara a emissão do evento passando o próprio card -->
  <button class="remover" (click)="remover.emit(card)">×</button>
</div>
```

#### **Por que mudou?**
* No Angular, componentes filhos **não devem alterar diretamente a lista do componente pai**. 
* O decorator `@Output()` cria um canal de comunicação no qual o filho dispara um aviso (`remover.emit(card)`) e o pai escuta e toma a providência de remover o item do array.

---

### 📄 3. `src/app/app.ts`

#### **ANTES (Parte 6)**
```typescript
export class App {
  aFazer: Card[] = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos' },
  ];
  // ...
}
```

#### **DEPOIS (Parte 7)**
```typescript
import { Component } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  // 🟢 Inicializa cada card gerando um UUID v4 nativo
  aFazer: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional' },
    { id: crypto.randomUUID(), titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos' },
  ];
  emAndamento: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github' },
  ];
  concluido: Card[] = [
    { id: crypto.randomUUID(), titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional' },
  ];

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  // 🟢 Adiciona novo card gerando id e atribuindo etiqueta padrão
  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    coluna.push({ id: crypto.randomUUID(), titulo, etiqueta: 'Geral' });
  }

  // 🟢 Remove o card especificado buscando o índice exato na coluna
  remover(coluna: Card[], card: Card) {
    const index = coluna.indexOf(card);
    if (index >= 0) coluna.splice(index, 1);
  }
}
```

---

### 📄 4. `src/app/app.html`

#### **ANTES (Parte 6)**
```html
<div class="column">
  <h2>A Fazer</h2>
  <div cdkDropList [cdkDropListData]="aFazer" ... class="dropzone">
    @for (c of aFazer; track c) { <!-- ❌ Rastreava pela referência do objeto -->
      <app-card-item [card]="c" cdkDrag />
    }
  </div>
</div>
```

#### **DEPOIS (Parte 7)**
```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    <div cdkDropList [cdkDropListData]="aFazer" [cdkDropListConnectedTo]="['emAndamento','concluido']"
         id="aFazer" (cdkDropListDropped)="drop($event)" class="dropzone">
      <!-- 🟢 1. Rastreia pelo ID do objeto e escuta o evento (remover) -->
      @for (c of aFazer; track c.id) {
        <app-card-item [card]="c" cdkDrag (remover)="remover(aFazer, $event)" />
      }
    </div>
    <!-- 🟢 2. Formulário inline com variável de referência #novoTituloAFazer -->
    <div class="nova-tarefa">
      <input #novoTituloAFazer placeholder="Nova tarefa" />
      <button (click)="adicionar(aFazer, novoTituloAFazer.value); novoTituloAFazer.value = ''">+</button>
    </div>
  </div>

  <div class="column">
    <h2>Em Andamento</h2>
    <div cdkDropList [cdkDropListData]="emAndamento" [cdkDropListConnectedTo]="['aFazer','concluido']"
         id="emAndamento" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of emAndamento; track c.id) {
        <app-card-item [card]="c" cdkDrag (remover)="remover(emAndamento, $event)" />
      }
    </div>
    <div class="nova-tarefa">
      <input #novoTituloEmAndamento placeholder="Nova tarefa" />
      <button (click)="adicionar(emAndamento, novoTituloEmAndamento.value); novoTituloEmAndamento.value = ''">+</button>
    </div>
  </div>

  <div class="column">
    <h2>Concluído</h2>
    <div cdkDropList [cdkDropListData]="concluido" [cdkDropListConnectedTo]="['aFazer','emAndamento']"
         id="concluido" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of concluido; track c.id) {
        <app-card-item [card]="c" cdkDrag (remover)="remover(concluido, $event)" />
      }
    </div>
    <div class="nova-tarefa">
      <input #novoTituloConcluido placeholder="Nova tarefa" />
      <button (click)="adicionar(concluido, novoTituloConcluido.value); novoTituloConcluido.value = ''">+</button>
    </div>
  </div>
</div>
```

#### **Detalhes Técnicos Importantes:**
1. **`track c.id`**: O Angular usa o `id` estável para reutilizar elementos no DOM em re-renderizações, melhorando significativamente a performance em relação ao rastreamento por objeto.
2. **`$event`**: Na instrução `(remover)="remover(aFazer, $event)"`, a palavra `$event` é reservada pelo Angular e carrega exatamente o dado emitido por `remover.emit(card)`.
3. **Variáveis de referência (`#novoTituloAFazer`, `#novoTituloEmAndamento`, `#novoTituloConcluido`)**: 
   * As variáveis marcadas com `#` criam referências locais para o elemento `<input>` no template.
   * **Atenção**: Variáveis de referência de template têm escopo em **todo o arquivo do template**. Se usássemos `#novoTitulo` em todas as três colunas, o Angular reportaria um erro de compilação devido à ambiguidade de nomes.

---

### 📄 5. `src/app/app.scss` e `src/app/card-item/card-item.scss`

#### `src/app/card-item/card-item.scss`
```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); position: relative; }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
/* 🟢 Estilização do botão discreto de exclusão (x) no canto superior direito do card */
.remover { position: absolute; top: 0.5rem; right: 0.5rem; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #999; }
```

#### `src/app/app.scss`
```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
.dropzone { min-height: 80px; }
/* 🟢 Alinhamento horizontal do campo de texto e botão de adição de nova tarefa */
.nova-tarefa { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.nova-tarefa input { flex: 1; min-width: 0; }
```

---

## 5. Exercício Prático: Testando a Criação, Exclusão e UUIDs

Realize este teste no seu ambiente local para observar o funcionamento em tempo de execução:

1. Atualize o código do seu projeto com as alterações da Parte 7 e execute `ng serve`.
2. **Crie duas tarefas com o mesmo título**:
   * Na coluna **A Fazer**, digite `Estudar Spring Boot` e clique em `+`.
   * Digite novamente `Estudar Spring Boot` e clique em `+`.
3. **Exclua uma das duas**:
   * Passe o mouse sobre um dos cards `Estudar Spring Boot` e clique no botão `×`.
4. **O que acontece?**
   * Apenas a tarefa em que você clicou será excluída, mantendo a outra intocada.
   * **Por que isso funcionou?** O método `remover()` encontrou a instância exata do objeto via `indexOf()` e o laço do Angular acompanhou a alteração pelo `track c.id`. Se a busca ou rastreamento dependesse do título, ambos os cards poderiam ser afetados ou desincronizados.

---

## 6. O Limite do Frontend e os Próximos Passos

Nesta Parte 7, nosso frontend Angular tornou-se **100% funcional em memória**: conseguimos visualizar colunas, arrastar e soltar cards, criar novas tarefas e excluir tarefas existentes.

No entanto, faça o seguinte teste: adicione 3 novas tarefas e **atualize a página no navegador (F5)**.

* **Resultado**: Todas as alterações feitas pelo usuário somem e a página volta ao estado inicial estático do código TypeScript.

Isso evidencia a necessidade real de um **backend persistente**. Na **Parte 8**, iniciamos o desenvolvimento do serviço backend em **Java 21 com Spring Boot**, criando o primeiro controlador REST para fornecer e persistir os dados do nosso quadro.