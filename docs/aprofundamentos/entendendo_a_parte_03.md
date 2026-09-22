# Entendendo o Angular Parte 3 para Desenvolvedores Backend

Para quem vem do ecossistema backend (como Java/Spring Boot), a estrutura do Angular moderno é surpreendentemente familiar. O Angular utiliza **TypeScript** (que possui sintaxe muito próxima ao Java, com tipagem e orientação a objetos) e **decorators** (que funcionam exatamente igual às **anotações** do Spring).

Nesta aula, analisaremos detalhadamente os dois arquivos da **Parte 3** do LOG de desenvolvimento: `src/app/app.ts` e `src/app/app.html`.

---

## 1. Mapeamento de Conceitos (Backend vs. Frontend Angular)

Veja como os conceitos do mundo Java/Spring se traduzem para o Angular:

| Conceito no Backend (Java/Spring) | Equivalente no Angular (TypeScript/HTML) | Função |
| :--- | :--- | :--- |
| Anotações (`@RestController`, `@Component`) | **Decorators (`@Component`)** | Define metadados e comportamento da classe. |
| Classe Controller / Service | **Classe do Componente (`export class App`)** | Gerencia dados e lógica da tela. |
| Atributos de Classe (`List<Card> cards`) | **Propriedades da Classe (`cards = [...]`)** | Armazena o estado/dados a serem exibidos. |
| Motor de Template (Thymeleaf/JSP) | **Template HTML (`app.html`)** | Define a estrutura visual e a exibição dinâmica dos dados. |

---

## 2. Anatomia do Código TypeScript (`src/app/app.ts`)

Na Parte 3 do LOG, os dados deixam de ser escritos manualmente no HTML e passam a residir em um **array de objetos na classe TypeScript**.

Código de `src/app/app.ts`:

```typescript
import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  cards = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional', coluna: 'A_FAZER' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos', coluna: 'A_FAZER' },
    { titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github', coluna: 'EM_ANDAMENTO' },
    { titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional', coluna: 'CONCLUIDO' },
  ];
}
```

### Explicação Passo a Passo:

1. **`import { Component } from '@angular/core';`**
   * Semelhante ao `import org.springframework.stereotype.Component;` do Java, importamos a função decoradora `Component` do núcleo do Angular.

2. **O Decorator `@Component({ ... })`**
   * Funciona exatamente como as anotações do Spring. Ele adiciona metadados à classe `App` informando que ela representa um componente visual:
     * **`selector: 'app-root'`**: Define a tag HTML personalizada do componente. Quando o Angular encontra `<app-root></app-root>` no `index.html`, ele injeta este componente.
     * **`templateUrl: './app.html'`**: Aponta para o arquivo de marcação visual (o HTML do componente).
     * **`styleUrl: './app.scss'`**: Aponta para o arquivo de estilos (CSS/SCSS).
     * **`imports: []`**: No Angular moderno (componentes *standalone*), esse array declara quais outros componentes ou módulos são utilizados pelo template.

3. **`export class App { ... }`**
   * O `export` em TypeScript equivale ao `public` no Java — permite que a classe seja importada por outros arquivos.
   * O nome `App` segue a convenção atual do Angular CLI (sem o antigo sufixo `.component`).

4. **`cards = [ ... ]`**
   * Atributo/propriedade da classe `App`.
   * Trata-se de um **array de objetos literais**, onde cada objeto tem os campos `titulo`, `etiqueta` e `coluna`.
   * No Java, isso seria o equivalente inicial a declarar uma lista inline como `List<Map<String, String>>` (estrutura que evolui para uma classe/interface tipada nas partes posteriores do LOG).

---

## 3. Anatomia do Template HTML (`src/app/app.html`)

No HTML, a Parte 3 utiliza os blocos modernos de controle de fluxo do Angular (`@for` e `@if`) para percorrer a lista `cards` e desenhar as três colunas dinamicamente.

Código de `src/app/app.html`:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    @for (c of cards; track c) {
      @if (c.coluna === 'A_FAZER') {
        <div class="card">
          <span class="tag">{{ c.etiqueta }}</span>
          <strong>{{ c.titulo }}</strong>
        </div>
      }
    }
  </div>

  <div class="column">
    <h2>Em Andamento</h2>
    @for (c of cards; track c) {
      @if (c.coluna === 'EM_ANDAMENTO') {
        <div class="card">
          <span class="tag">{{ c.etiqueta }}</span>
          <strong>{{ c.titulo }}</strong>
        </div>
      }
    }
  </div>

  <div class="column">
    <h2>Concluído</h2>
    @for (c of cards; track c) {
      @if (c.coluna === 'CONCLUIDO') {
        <div class="card">
          <span class="tag">{{ c.etiqueta }}</span>
          <strong>{{ c.titulo }}</strong>
        </div>
      }
    }
  </div>
</div>
```

### Explicação Passo a Passo:

1. **Iteração com `@for (c of cards; track c)`**
   * É o equivalente ao laço `for (var c : cards)` do Java ou `th:each` do Thymeleaf.
   * **O que significa o `track c`?**
     * O Angular exige um critério de rastreamento para saber identificar cada item da lista ao atualizar a tela.
     * Como na Parte 3 os objetos ainda não possuem um ID único (como um UUID), utiliza-se a própria referência do objeto `c` como identificador. Nas etapas seguintes, o LOG substitui essa cláusula por `track c.id`.

2. **Condicional com `@if (c.coluna === 'A_FAZER')`**
   * Uma instrução condicional aninhada ao laço.
   * Como o array `cards` guarda todos os cards do quadro, o laço percorre a lista completa dentro de cada coluna e só renderiza a marcação HTML se a propriedade `coluna` do card corresponder ao nome da coluna em questão.

3. **Interpolação de Texto `{{ c.etiqueta }}` e `{{ c.titulo }}`**
   * As chaves duplas `{{ expression }}` no Angular realizam a **Interpolação**.
   * Elas leem a propriedade do objeto TypeScript e a projetam no HTML em tempo de execução.

---

## 4. Exercício Prático: Implemente e Teste no Seu Projeto

Para fixar o funcionamento da integração entre `app.ts` e `app.html`, realize o teste a seguir no seu ambiente de desenvolvimento:

### Passo 1: Edite o arquivo `src/app/app.ts`
Abra o arquivo `src/app/app.ts` e adicione um quinto card ao array `cards`:

```typescript
import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  cards = [
    { titulo: 'Concluir E-commerce Portfolio', etiqueta: 'Profissional', coluna: 'A_FAZER' },
    { titulo: "O'Reilly Java Learning Path", etiqueta: 'Estudos', coluna: 'A_FAZER' },
    { titulo: 'Finalizar Debugging Design Patterns', etiqueta: 'Github', coluna: 'EM_ANDAMENTO' },
    { titulo: 'Melhorar Apresentação Perfil Github', etiqueta: 'Profissional', coluna: 'CONCLUIDO' },
    // TESTE PRÁTICO: NOVO CARD ADICIONADO
    { titulo: 'Aprender sintaxe básica do Angular', etiqueta: 'Estudos', coluna: 'A_FAZER' },
  ];
}
```

### Passo 2: Execute o servidor local
No terminal, na pasta do frontend, execute:
```bash
ng serve
```
Acesse `http://localhost:4200` no navegador.

### Passo 3: Verifique o comportamento
* O card **"Aprender sintaxe básica do Angular"** aparecerá na coluna **"A Fazer"**.
* **O que aconteceu?**
  1. A classe `App` disponibilizou a propriedade `cards` com 5 itens.
  2. O template `app.html` executou o `@for (c of cards; track c)` na coluna **A Fazer**.
  3. O bloco `@if (c.coluna === 'A_FAZER')` retornou `true` para o novo card e imprimiu seu título e etiqueta usando `{{ }}`.

### Passo 4: Mude a coluna do card
No `app.ts`, mude o valor de `coluna` do novo card para `'CONCLUIDO'`:

```typescript
{ titulo: 'Aprender sintaxe básica do Angular', etiqueta: 'Estudos', coluna: 'CONCLUIDO' }
```

Salve o arquivo. A tela atualizará instantaneamente e o novo card mudará para a coluna **"Concluído"**, demonstrando como o template reage às alterações dos dados na classe TypeScript.

---