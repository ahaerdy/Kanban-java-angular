# Aula 6: Arrastar e Soltar entre Colunas (Angular CDK)

## 1. O Problema da Parte 5 e a Motivação para a Mudança na Parte 6

Na **Parte 5**, modularizamos a interface extraindo a exibição do card para o componente filho `CardItemComponent`. No entanto, nosso quadro Kanban ainda era puramente estático: os cards estavam travados em suas colunas originais e não havia interatividade para movê-los.

Para implementar a funcionalidade essencial de um quadro Kanban — **o recurso de Arrastar e Soltar (Drag and Drop)** —, a **Parte 6** introduz o pacote oficial **Angular CDK** (`@angular/cdk/drag-drop`).

Essa adição exigiu uma **reestruturação na forma como os dados são armazenados no frontend**:
* **Na Parte 5**: Tínhamos um único array `cards: Card[]` com todos os cards misturados, e o template usava o método `porColuna()` para filtrar quais cards exibir em cada coluna.
* **Na Parte 6**: O módulo Drag and Drop do Angular CDK exige que cada área de soltura (coluna) esteja diretamente vinculada a uma coleção/lista própria de dados. Por essa razão, migramos de 1 único array para **3 arrays independentes**: `aFazer`, `emAndamento` e `concluido`.

---

## 2. Mapeamento de Conceitos (Java / Backend vs. Angular CDK)

Para desenvolvedores acostumados com a lógica de coleções e gerenciamento de estado no backend:

| Conceito no Java / Spring | Equivalente no Angular CDK (Parte 6) | Função |
| :--- | :--- | :--- |
| **`List<Card>` por Categoria** | **`aFazer: Card[]`, `emAndamento: Card[]`, `concluido: Card[]`** | Listas independentes que alimentam cada zona de soltar no template. |
| **`list.add(index, item)` / `list.remove(index)`** | **`moveItemInArray` / `transferArrayItem`** | Funções utilitárias do Angular CDK que reordenam ou transferem objetos entre arrays. |
| **Evento de Transferência de Dados / DTO** | **`CdkDragDrop<Card[]>`** | Objeto contendo os metadados da ação do usuário (origem, destino, índices inicial e final). |
| **Anotação de Módulo / Dependência** | **`DragDropModule`** | Módulo que disponibiliza as diretivas `cdkDropList` e `cdkDrag` no Angular. |

---

## 3. Visão Geral das Alterações (Estrutura de Arquivos)

| Arquivo | Status na Parte 6 | O que mudou e Por quê? |
| :--- | :--- | :--- |
| `src/app/models/card.ts` | **Sem alteração** | Mantém a interface `Card` definida na Parte 4. |
| `src/app/card-item/*` | **Sem alteração** | O `CardItemComponent` continua intacto, exibindo o card via `@Input()`. |
| `src/app/app.ts` | **Alterado** | Troca o array único por 3 arrays separados, importa o `DragDropModule` e adiciona o método `drop()`. |
| `src/app/app.html` | **Alterado** | Adiciona as diretivas `cdkDropList`, `cdkDropListConnectedTo`, `cdkDropListDropped` e `cdkDrag`. |
| `src/app/app.scss` | **Alterado** | Adiciona a classe `.dropzone { min-height: 80px; }` para que colunas vazias mantenham uma área clicável/soltável. |

---

## 4. Comparação Lado a Lado (Parte 5 vs. Parte 6)

### 📄 1. `src/app/app.ts`

#### **ANTES (Parte 5)**
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
  // ❌ Array único com todos os cards misturados
  cards: Card[] = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional', coluna: 'A_FAZER' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos', coluna: 'A_FAZER' },
    { titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github', coluna: 'EM_ANDAMENTO' },
    { titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional', coluna: 'CONCLUIDO' },
  ];

  // ❌ Filtro executado toda vez que o template renderiza
  porColuna(coluna: Card['coluna']): Card[] {
    return this.cards.filter(c => c.coluna === coluna);
  }
}
```

#### **DEPOIS (Parte 6)**
```typescript
import { Component } from '@angular/core';
// 🟢 1. Importa as utilidades de Drag and Drop do Angular CDK
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';

@Component({
  // 🟢 2. Registra o DragDropModule no array de imports
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  // 🟢 3. Três arrays separados, um para cada coluna
  aFazer: Card[] = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional', coluna: 'A_FAZER' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos', coluna: 'A_FAZER' },
  ];
  emAndamento: Card[] = [
    { titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github', coluna: 'EM_ANDAMENTO' },
  ];
  concluido: Card[] = [
    { titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional', coluna: 'CONCLUIDO' },
  ];

  // 🟢 4. Método invocado automaticamente quando o usuário solta um card
  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      // Reordena os elementos no mesmo array (mesma coluna)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfere o elemento do array de origem para o array de destino
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }
}
```

#### **Por que essa mudança ocorreu?**
* O CDK precisa manipular mutações diretas em listas (`array.splice`, reordenação de índices).
* Se a página usasse uma chamada de função como `porColuna('A_FAZER')` diretamente na diretiva de soltura, o CDK não conseguiria modificar o array retornado, pois ele seria um array temporário criado pelo método `.filter()`.
* O método `drop` verifica se o contêiner de destino (`event.container`) é igual ao contêiner de origem (`event.previousContainer`):
  * **Mesma coluna**: chama `moveItemInArray`.
  * **Colunas diferentes**: chama `transferArrayItem`.

---

### 📄 2. `src/app/app.html`

#### **ANTES (Parte 5)**
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

#### **DEPOIS (Parte 6)**
```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    <!-- 🟢 Zona de soltar conectada às outras duas colunas -->
    <div cdkDropList [cdkDropListData]="aFazer" [cdkDropListConnectedTo]="['emAndamento','concluido']"
         id="aFazer" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of aFazer; track c) {
        <!-- 🟢 Torna o card filho arrastável -->
        <app-card-item [card]="c" cdkDrag />
      }
    </div>
  </div>

  <div class="column">
    <h2>Em Andamento</h2>
    <div cdkDropList [cdkDropListData]="emAndamento" [cdkDropListConnectedTo]="['aFazer','concluido']"
         id="emAndamento" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of emAndamento; track c) {
        <app-card-item [card]="c" cdkDrag />
      }
    </div>
  </div>

  <div class="column">
    <h2>Concluído</h2>
    <div cdkDropList [cdkDropListData]="concluido" [cdkDropListConnectedTo]="['aFazer','emAndamento']"
         id="concluido" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of concluido; track c) {
        <app-card-item [card]="c" cdkDrag />
      }
    </div>
  </div>
</div>
```

#### **Explicação das Diretivas do Angular CDK no HTML:**
1. **`cdkDropList`**: Declara a `<div>` como uma zona receptora de itens arrastáveis.
2. **`[cdkDropListData]="aFazer"`**: Conecta a zona ao array correspondente no TypeScript.
3. **`[cdkDropListConnectedTo]="['emAndamento','concluido']"`**: Permite a movimentação inter-colunas. **Sem isso, a coluna só aceitaria reordenar cards dentro dela mesma!**
4. **`id="aFazer"`**: Identificador único de cada zona de soltar.
5. **`(cdkDropListDropped)="drop($event)"`**: Dispara o evento ao soltar o item.
6. **`cdkDrag`**: Aplicado na tag `<app-card-item />`, transforma o componente filho em um elemento arrastável.

---

### 📄 3. `src/app/app.scss`

#### **ANTES (Parte 5)**
```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
```

#### **DEPOIS (Parte 6)**
```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }

/* 🟢 Garante uma altura mínima para soltar cards em uma coluna totalmente vazia */
.dropzone { min-height: 80px; }
```

#### **Por que o `.dropzone` é necessário?**
Se uma coluna ficar sem nenhum card (array vazio), a altura da sua `<div>` interna colapsaria para `0px`, tornando fisicamente impossível para o usuário mira-la com o mouse para soltar um card lá dentro. A regra `min-height: 80px` resolve isso.

---

## 5. Limitação Identificada na Parte 6

O LOG registra um detalhe importante sobre o estado dos dados nesta etapa:
* Embora o card mude de coluna visualmente e seja transferido de um array para outro no JavaScript (`aFazer` -> `emAndamento`), o campo interno `coluna` presente no objeto `Card` (ex: `c.coluna = 'A_FAZER'`) **não é atualizado no método `drop()`**.
* Como a interface não lê mais essa propriedade para renderizar as colunas (pois agora lê arrays separados), isso não causa nenhum defeito visual no momento. No entanto, nas etapas futuras (ao integrar com banco de dados no backend), essa sincronização passará a ser tratada.

---

## 6. Exercício Prático: Testando o Comportamento do CDK

Instale o pacote e teste no seu projeto local:

### Passo 1: Instale o Angular CDK
No terminal do projeto frontend, execute:
```bash
npm install @angular/cdk
```

### Passo 2: Atualize os arquivos `app.ts`, `app.html` e `app.scss`
Aplique os códigos da Parte 6 apresentados acima e inicie o servidor:
```bash
ng serve
```

### Passo 3: Teste da Conexão entre Colunas (Experimento Didático)
No arquivo `app.html`, remova temporariamente o atributo `[cdkDropListConnectedTo]` da coluna **"A Fazer"**:

```html
<!-- Teste: removendo a conexão com as outras colunas -->
<div cdkDropList [cdkDropListData]="aFazer" id="aFazer" (cdkDropListDropped)="drop($event)" class="dropzone">
```

1. Tente arrastar um card da coluna **"A Fazer"** para **"Em Andamento"**.
2. **O que acontece?** O navegador impedirá a soltura e o card voltará suavemente para a coluna original.
3. **Conclusão**: O Angular CDK implementa uma trava de segurança estrita. Uma zona só aceita receber elementos de outra zona se estiverem explicitamente conectadas via `cdkDropListConnectedTo`.

---

## 7. O Que Vem a Seguir?

A Parte 6 trouxe a interatividade essencial ao quadro Kanban. No entanto, você notou que ainda usamos a referência dos objetos para rastreamento (`track c` no `@for`) e não conseguimos **criar novos cards** nem **deletar cards existentes**?

Na **Parte 7**, o projeto introduz identificadores únicos (`id: crypto.randomUUID()`), formulários simples de inserção de tarefas e a funcionalidade de exclusão com eventos customizados (`@Output()`).

