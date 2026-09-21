# Tutorial Orgânico: Construindo um Kanban com Backend em Java e Frontend em Angular

> Documento de uso pessoal (seu e meu), no mesmo espírito do [`tutorial-sudoku-java-organico.md`](./tutorial-sudoku-java-organico.md) e guiado pela mesma bússola do [`metodologia_design_emergente.md`](./metodologia_design_emergente.md). Aqui não existe roteiro fixo com etapas numeradas *a priori* — existe o ciclo "resolva o mais simples → rode → sentiu dor? refatore o mínimo → siga" se repetindo, e o catálogo de gatilhos (heurísticas) sendo consultado a cada volta. As "Partes" abaixo são a ordem em que a dor **normalmente** aparece nesse tipo de projeto — não uma ordem obrigatória. Se, no seu caso concreto, a dor aparecer em outra ordem, siga a dor, não o índice.
>
> **Como usar este documento:** implemente uma Parte por vez, rode, confirme o teste rápido, e só então registre a etapa no seu `LOG.md` (no mesmo formato do `log_de_desenvolvimento.md` do Sudoku) — com suas próprias palavras, sua própria data, e qualquer desvio que você tenha tomado em relação ao que está escrito aqui. O LOG é o que você vai eventualmente publicar; este tutorial, não.

## Por que Kanban é um problema diferente do Sudoku (e o que isso muda no método)

O Sudoku tinha uma vantagem: um domínio pequeno, fechado, com regras fixas (81 células, 1 a 9, sem repetição). O Kanban que você quer construir tem duas complicações novas que vão aparecer, cedo ou tarde, no catálogo de gatilhos:

1. **Duas linguagens de programação, dois processos.** Angular roda no navegador; Java vai rodar num processo de backend separado, conversando por HTTP. Isso significa que "a dor" vai poder aparecer nos dois lados — às vezes ao mesmo tempo, às vezes só de um lado (ex.: um smell de coesão só no controller Java; um smell de duplicação só nos componentes Angular). Cada Parte deste tutorial deixa claro **de qual lado da stack** ela trata.
2. **O estado precisa sobreviver ao F5.** No Sudoku, `Board` vivia inteiro na memória do próprio processo Swing — fechar a janela, perde tudo, e não tinha problema, era assim que o projeto foi definido desde o início. Um Kanban que esquece suas tarefas ao recarregar a página é, na prática, inútil — então a persistência não é um "extra" que pode ficar para depois: ela é, ela mesma, um dos gatilhos que vamos sentir doer ao longo do caminho (Parte 8 e Parte 12, esta já usando MySQL em um container Docker, e não um banco embutido de desenvolvimento).

Fora isso, a mentalidade é **idêntica** à do tutorial do Sudoku: comece pelo mais simples e visível possível, sinta a dor antes de resolvê-la, e consulte o catálogo de gatilhos do `metodologia_design_emergente.md` a cada refatoração — vou citar o número do gatilho (`#1`, `#3`, etc.) sempre que uma extração deste tutorial for motivada por um deles, exatamente como fizemos no Sudoku.

### Onde vamos parar (por agora)

Este tutorial cobre até um Kanban **funcional, persistente, single-user, sem autenticação** — colunas fixas (A Fazer / Em Andamento / Concluído), cards com título, descrição e etiquetas coloridas, arrastar-e-soltar entre colunas, tudo salvo em banco. É deliberadamente **menos ambicioso** que o print do Gemini em alguns pontos (ele mostra múltiplos boards, busca, notificações, avatar de usuário) — esses pontos vão para a seção de encerramento como decisões conscientes de YAGNI, não como itens esquecidos.

### Uma nota sobre este tutorial e sua experiência prévia

Você chega neste projeto sabendo o básico de JavaScript/TypeScript, mas sem experiência com Angular. Por isso, duas seções foram adicionadas **antes da Parte 0**, que não existiam no tutorial do Sudoku (lá, Java já era familiar): um guia de instalação de tudo o que você precisa ter na máquina, e um "primer" da sintaxe específica do Angular (decorators, *binding*, diretivas, serviços) — o suficiente para você reconhecer cada peça quando ela aparecer pela primeira vez no código, sem precisar sair pesquisando por fora. Ao longo das Partes, sempre que uma sintaxe **nova** aparecer pela primeira vez, ela volta a ser explicada no contexto — o primer é só a "visão geral" antes de mergulhar.

---

## Pré-requisitos e instalação

Esta seção não faz parte do ciclo de Design Emergente propriamente dito — é preparação de ambiente, equivalente a "abrir o IntelliJ e criar um projeto Java" no tutorial do Sudoku. Faça isso uma única vez, antes da Parte 0.

### O que você vai instalar, e por quê

| Ferramenta | Para que serve neste projeto |
|---|---|
| **Node.js** (inclui o `npm`) | Ambiente de execução de JavaScript fora do navegador; é o que roda o Angular CLI e todas as ferramentas de build do frontend. |
| **Angular CLI** | Ferramenta de linha de comando que cria, roda e builda projetos Angular (usamos `ng new`, `ng serve`, etc.). |
| **Um editor para o frontend** | Recomendado: **Visual Studio Code** (gratuito), com boa integração TypeScript/Angular. |
| **JDK (Java Development Kit) 21** | Necessário para compilar e rodar o backend Java. |
| **Maven** | Ferramenta de build do backend Java (geralmente já vem embutida na IDE, não precisa instalar separado se usar IntelliJ). |
| **Uma IDE Java** | Recomendado: **IntelliJ IDEA** (Community Edition, gratuita) — a mesma que você já usou no projeto do Sudoku. |
| **Docker Desktop** | Roda o MySQL em um container, sem precisar instalar o banco diretamente no sistema (detalhado na Parte 12, mas já pode instalar agora). |

Repare que são **dois ambientes de desenvolvimento separados, para duas linguagens diferentes** — isso é normal em projetos full-stack, e é justamente um dos pontos citados na introdução deste documento ("duas linguagens, dois processos"). Você vai ter, ao final, duas pastas de projeto independentes (`frontend` e `backend`), cada uma aberta em seu próprio editor, e dois processos rodando ao mesmo tempo no seu computador.

### 1. Instalando o Node.js

1. Acesse [nodejs.org](https://nodejs.org/) e baixe a versão **LTS** (*Long Term Support* — a versão recomendada para a maioria dos usos, mais estável que a "Current").
2. Instale seguindo o instalador padrão do seu sistema operacional (Windows: `.msi`; Mac: `.pkg`; Linux: geralmente via gerenciador de pacotes ou o instalador do próprio site).
3. Confirme a instalação abrindo um terminal (Prompt de Comando, PowerShell ou Terminal) e rodando:
   ```bash
   node --version
   npm --version
   ```
   Ambos os comandos devem imprimir um número de versão (ex.: `v20.11.0` e `10.2.4`) — se aparecer "comando não encontrado", a instalação não completou corretamente ou o terminal precisa ser reaberto.

> 💡 **O que é `npm`?** *Node Package Manager* — o gerenciador de pacotes/bibliotecas do ecossistema Node.js/JavaScript. É o equivalente, em espírito, ao Maven do mundo Java: você declara quais bibliotecas seu projeto precisa (num arquivo `package.json`, gerado automaticamente), e o `npm install` baixa e organiza tudo numa pasta `node_modules`.

### 2. Instalando o Angular CLI

Com o Node.js instalado, rode no terminal:

```bash
npm install -g @angular/cli
```

- `-g` — instala **globalmente** no seu computador (não dentro de um projeto específico), tornando o comando `ng` disponível em qualquer pasta.
- `@angular/cli` — o nome do pacote no npm.

Confirme com:

```bash
ng version
```

Deve imprimir a versão do Angular CLI instalada (e reclamar, sem problema, que ainda não há nenhum projeto Angular na pasta atual — isso é esperado).

### 3. Instalando o Visual Studio Code (editor do frontend)

1. Baixe em [code.visualstudio.com](https://code.visualstudio.com/) e instale.
2. Ao abrir, instale a extensão **Angular Language Service** (ícone de extensões na barra lateral, buscar por "Angular Language Service", da própria equipe do Angular) — ela dá autocomplete e detecção de erros dentro dos templates HTML/Angular, o que ajuda bastante sem experiência prévia.

### 4. Instalando o JDK 21

Você já tem isso configurado do projeto do Sudoku (JDK 17+ foi pedido lá; aqui pedimos 21 especificamente por compatibilidade com as versões atuais do Spring Boot). Confirme com:

```bash
java --version
```

Se aparecer uma versão 21 ou superior, está pronto. Se não, baixe em [adoptium.net](https://adoptium.net/) (distribuição Temurin, gratuita) e instale.

### 5. Confirmando o IntelliJ IDEA

Mesma IDE usada no Sudoku. Se precisar reinstalar: [jetbrains.com/idea](https://www.jetbrains.com/idea/download/) (edição **Community**, gratuita, é suficiente para projetos Spring Boot simples).

### 6. Instalando o Docker Desktop

1. Baixe em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) e instale (Windows/Mac/Linux).
2. Abra o Docker Desktop uma vez após instalar — ele precisa estar rodando em segundo plano sempre que você for subir o banco (a Parte 12 detalha o uso).
3. Confirme no terminal:
   ```bash
   docker --version
   docker compose version
   ```

### Checklist final antes da Parte 0

- [ ] `node --version` e `npm --version` respondem no terminal
- [ ] `ng version` responde no terminal
- [ ] VS Code instalado, com a extensão Angular Language Service
- [ ] `java --version` mostra 21 ou superior
- [ ] IntelliJ IDEA aberto e funcionando
- [ ] `docker --version` e `docker compose version` respondem no terminal

---

## Antes da Parte 0: sintaxe básica de Angular e TypeScript que vamos usar o tempo todo

Você já conhece o básico de JavaScript/TypeScript (variáveis, funções, `if`/`for`, arrays, objetos). O que muda em Angular é uma camada de sintaxe **própria do framework**, que aparece dentro de arquivos `.ts` e dentro dos arquivos de template (`.html`). Esta seção é só uma **referência rápida** — cada item volta a ser explicado, com mais contexto, na primeira vez que aparecer de verdade no código (procure pela palavra em negrito nos Glossários de cada Parte).

> 📌 Esta seção reflete a versão do Angular CLI usada neste projeto (22.x). Se você já viu tutoriais mais antigos de Angular na internet, vai notar duas diferenças logo de cara: os arquivos gerados não terminam em `.component.ts`, e os loops em template não usam `*ngFor`. As duas mudanças são explicadas abaixo.

### Decorators (`@Algo`)

```typescript
@Component({ ... })
export class App { }
```

Um **decorator** é uma anotação colocada logo acima de uma classe (ou propriedade, ou método), começando com `@`, que adiciona metadados ou comportamento especial a ela — sem alterar o código da classe em si. `@Component` diz ao Angular "esta classe TypeScript comum é, na verdade, um componente visual; aqui estão as configurações dele". Você vai ver `@Component`, `@Input`, `@Output` e `@Injectable` ao longo deste tutorial — todos seguem essa mesma ideia.

> Se você programou Java antes (como no Sudoku), decorators do TypeScript cumprem um papel parecido com as **anotações** do Java (`@Entity`, `@Service`, que também vamos usar no backend) — mesma ideia, sintaxe parecida, ecossistemas diferentes.

### Componentes "standalone" (o padrão atual, sem flag nenhuma)

Versões mais antigas do Angular exigiam um `NgModule` central (`AppModule`) importando cada componente da aplicação, e o `@Component` precisava declarar `standalone: true` explicitamente para escapar disso. Na versão do Angular CLI usada aqui, **todo componente já nasce standalone por padrão** — não existe `AppModule`, e você não vai ver `standalone: true` em lugar nenhum do código gerado. Cada componente declara, ele mesmo, do que precisa através de um array `imports: [...]` dentro do `@Component`.

### Interpolação: `{{ valor }}`

Dentro de um template, chaves duplas inserem o valor de uma expressão TypeScript no HTML:

```html
<h1>{{ titulo }}</h1>
```

Se a classe do componente tiver uma propriedade `titulo = 'Kanban'`, o navegador exibe `<h1>Kanban</h1>`. Funciona com qualquer expressão simples (`{{ 2 + 2 }}`, `{{ card.titulo }}`, `{{ minhaFuncao() }}`).

### *Property binding*: `[propriedade]="expressao"`

Colchetes ligam uma propriedade de um elemento HTML (ou de um componente) a uma expressão TypeScript:

```html
<img [src]="urlDaImagem">
```

Diferente de `src="urlDaImagem"` (que trataria `urlDaImagem` como texto literal), `[src]="urlDaImagem"` avalia `urlDaImagem` como uma variável/expressão do componente.

### *Event binding*: `(evento)="expressao"`

Parênteses ligam um evento do navegador (clique, digitação, etc.) a uma ação:

```html
<button (click)="salvar()">Salvar</button>
```

Ao clicar, o método `salvar()` da classe do componente é chamado.

### Control flow no template: `@for` e `@if`

Versões mais antigas do Angular repetiam e condicionavam elementos com as diretivas `*ngFor`/`*ngIf` (que você ainda vai encontrar em tutoriais e Stack Overflow mais antigos). A versão usada aqui já vem com uma sintaxe de **blocos de controle** nativa do próprio compilador de templates — mais parecida com código de verdade, e sem precisar importar nada:

```html
@for (item of lista; track item.id) {
  <div>{{ item.titulo }}</div>
} @empty {
  <p>Nada por aqui ainda.</p>
}

@if (condicao) {
  <p>Só aparece se condicao for true</p>
} @else {
  <p>Aparece caso contrário</p>
}
```

- `@for (item of lista; track item.id)` — repete o bloco para cada item de `lista`. O `track` é **obrigatório**: ele diz ao Angular como identificar, entre um render e o próximo, se um item é "o mesmo de antes" (para não recriar o DOM à toa) ou um item novo. Quando os itens têm um identificador único e estável (como o `id` que vamos introduzir na Parte 7), `track item.id` é a escolha certa; antes disso, usamos `track item` (compara o objeto em si) como solução provisória.
- `@empty` — bloco opcional, mostrado quando a lista está vazia.
- `@if` / `@else` — substituem o antigo `*ngIf`.

### Classes, interfaces e `import`/`export`

TypeScript organiza código em **arquivos-módulo**: cada arquivo `export`a o que quer disponibilizar (uma classe, uma função, um tipo), e outros arquivos `import`am o que precisam:

```typescript
// arquivo card.ts
export interface Card { titulo: string; }

// outro arquivo
import { Card } from './models/card';
```

Isso é diferente do Java, onde a "unidade" de organização é o pacote (`package`) e o `import` referencia um caminho de pacote — aqui, o `import` referencia o **caminho do arquivo** (`./models/card`, com `./` significando "nesta mesma pasta").

### Serviços e injeção de dependência (`inject`, `@Injectable`)

Um **serviço** Angular é só uma classe TypeScript comum, marcada com `@Injectable`, que o Angular sabe criar e "entregar" automaticamente para quem precisar dela (via `inject(NomeDoServico)` dentro de um componente) — sem que você precise escrever `new NomeDoServico()` manualmente. Isso é a mesma ideia da injeção de dependência que vamos ver no backend Java com `@Service` e construtor — mesmo conceito, dois frameworks diferentes aplicando-o.

### `Observable` e `.subscribe(...)`

Chamadas HTTP em Angular não devolvem o valor diretamente (como uma função síncrona faria) — elas devolvem um `Observable`, uma "promessa de valor(es) futuro(s)". Nada acontece até você chamar `.subscribe(valor => ...)`, informando o que fazer quando o valor chegar:

```typescript
http.get('/cards').subscribe(cards => console.log(cards));
```

Isso existe porque uma requisição de rede é, por natureza, **assíncrona** — o navegador não pode travar esperando a resposta do servidor chegar.

> Este primer não substitui a explicação de cada Parte — ele só te dá um mapa geral antes de começar. Volte aqui sempre que precisar relembrar o que uma sintaxe faz, mas confie nas explicações de cada Parte para o "porquê" de cada uma ter sido usada naquele momento específico.

---

## Parte 0 — Só quero ver uma página no navegador

### A mentalidade desta parte

Mesma ideia do Sudoku: antes de pensar em coluna, card, ou banco de dados, só quero confirmar que o ambiente Angular está de pé e desenhando alguma coisa na tela.

### Preparando o projeto

1. Com o Node.js e o Angular CLI já instalados (seção de pré-requisitos acima), abra um terminal na pasta `projeto/` do seu repositório (ex.: `cd kanban-java-angular/projeto`).
2. Gere o projeto, já com o nome de pasta final desejado (`frontend`):
   ```bash
   ng new frontend --routing=false --style=scss
   ```
   O CLI vai fazer uma ou duas perguntas no terminal — incluindo, em versões recentes, uma pergunta sobre **integração com ferramentas de IA** (Claude Code, Cursor, etc.): responda **"None"**, já que você está seguindo este tutorial manualmente, não através de um agente de IA operando dentro do editor (isso pode ser adicionado depois, a qualquer momento, com `ng generate ai-config`). Para *Server-Side Rendering*, responda **"No"** — não precisamos disso. Isso cria uma pasta `frontend/` inteira, já com toda a estrutura básica de um projeto Angular.
3. Entre na pasta recém-criada e suba o servidor de desenvolvimento:
   ```bash
   cd frontend
   ng serve
   ```
   `ng serve` compila o projeto e sobe um servidor local que fica **rodando** no terminal (ele não devolve o controle do terminal — é assim que deve ser; deixe essa janela aberta enquanto trabalha, e abra um terminal **novo** se precisar rodar outro comando).
4. Abra `http://localhost:4200` no navegador — você deve ver a tela padrão do Angular ("Hello, frontend" com o logo do Angular). `4200` é a porta padrão onde o `ng serve` publica a aplicação.

### Conhecendo os arquivos que o `ng new` criou

Abra a pasta `frontend` no VS Code (`File > Open Folder...`). Dentro de `src/app/`, você vai encontrar:

| Arquivo | Para que serve |
|---|---|
| `app.ts` | A classe do **componente raiz** — o equivalente ao que era chamado `app.component.ts` em versões mais antigas do Angular. Note que o CLI atual não usa mais o sufixo `.component` no nome do arquivo. |
| `app.html` | O **template** (HTML) desse componente, num arquivo separado. |
| `app.scss` | O **estilo** (CSS/SCSS) desse componente, também separado. |
| `app.config.ts` | Configurações globais da aplicação — é aqui, e não em `main.ts`, que vamos registrar serviços como o `HttpClient` mais adiante (Parte 9). |
| `app.spec.ts` | Teste automatizado gerado por padrão (não vamos usar neste tutorial, mas não precisa apagar). |

> 💡 **Por que arquivos separados, e não um `template:` inline como em alguns tutoriais antigos?** O CLI atual já gera cada componente com HTML e estilo em arquivos próprios por padrão, mesmo para um componente simples. Isso foge um pouco da filosofia "não crie estrutura antes de precisar" do Design Emergente — mas como é o **próprio gerador** que já entrega assim, não faz sentido lutar contra ele desfazendo essa separação; seguimos o padrão do CLI e aplicamos o princípio de "simplicidade primeiro" dentro de cada arquivo, não na escolha de quantos arquivos existem.

### O código

Abra `src/app/app.ts`. Você vai encontrar algo como:

```typescript
import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
```

Simplifique para:

```typescript
import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
```

Agora abra `src/app/app.html` e substitua **todo o conteúdo** (o placeholder gigante com o logo do Angular) por:

```html
<h1>Kanban</h1>
```

Salve os dois arquivos (`Ctrl+S` / `Cmd+S`). Com o `ng serve` ainda rodando no terminal, o navegador deve recarregar sozinho.

### Explicando

- **"Componente"**, em Angular, é a unidade básica de UI: uma classe TypeScript (`export class App {}`) associada a um template (`app.html`) e, opcionalmente, estilo (`app.scss`). Cada tela ou pedaço reutilizável de tela do seu app vai virar um componente — já adiantando, vamos criar um componente de card na Parte 5.
- `@Component({ ... })` — o **decorator** que transforma a classe comum `App` num componente Angular de verdade (ver o primer de sintaxe, acima, se este termo ainda não fez sentido). Tudo o que está dentro dos `{ }` são as **configurações** desse componente.
- `selector: 'app-root'` — o "nome" desse componente como uma tag HTML customizada. Se você abrir `src/index.html` (o único arquivo HTML "de verdade" do projeto, servido pelo navegador), vai encontrar `<app-root></app-root>` dentro do `<body>` — é ali que o Angular "planta" este componente na página.
- `imports: []` — a lista de outros componentes, diretivas ou módulos que este componente usa dentro do seu template. Está vazia porque, por enquanto, `App` não usa nada de fora. Isso vai crescer já na Parte 5.
- `templateUrl` / `styleUrl` — caminhos (relativos a este arquivo) para o HTML e o estilo do componente. É o equivalente, em espírito, ao que teria sido um `template:`/`styles:` inline em outras versões do Angular — aqui, só que em arquivos próprios.
- `export class App {}` — uma classe TypeScript comum, do jeito que você já conhece (`class Nome { }`), só que **exportada** (`export`) para que outros arquivos possam importá-la — no caso de `App`, quem importa é o arquivo `src/main.ts`, que "liga" a aplicação inteira (não precisa mexer nele por enquanto).
- Note que não existe, ainda, **nenhuma noção de coluna, card ou board**. É exatamente o equivalente ao `JFrame` vazio do Sudoku, Parte 0.

### Glossário — Parte 0

| Termo | Significado |
|---|---|
| **Angular CLI** | Ferramenta de linha de comando que gera, roda e builda projetos Angular. |
| **Componente standalone** | Componente Angular que declara suas próprias importações (via `imports: []`), sem depender de um `NgModule` central. É o padrão nesta versão do Angular. |
| **`ng serve`** | Comando que compila o projeto e o serve localmente com recarregamento automático a cada alteração. |
| **`templateUrl` / `styleUrl`** | Caminhos para os arquivos de template e estilo de um componente, quando eles não estão inline no próprio `@Component`. |

### 🧪 Teste rápido

Rode `ng serve`. Em `http://localhost:4200`, você deve ver apenas o texto "Kanban" em destaque, sem nenhum outro elemento visual.

---

## Parte 1 — As três colunas "na unha"

### A mentalidade desta parte

O próximo impulso natural, olhando para o print do Gemini, é: "quero ver as três colunas coloridas lado a lado". Ainda sem pensar em dados — só o esqueleto visual, em HTML puro dentro do próprio template.

### O código

`src/app/app.html`:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
  </div>
  <div class="column">
    <h2>Em Andamento</h2>
  </div>
  <div class="column">
    <h2>Concluído</h2>
  </div>
</div>
```

`src/app/app.scss`:

```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
```

### Explicando

- `display: flex` no `.board` — coloca as três `.column` lado a lado, na horizontal, sem precisar calcular posição manualmente (o equivalente Angular/CSS ao `GridLayout` do Swing no Sudoku).
- Cada coluna é, por enquanto, **apenas um título** — copiado e colado três vezes, mudando só o texto. Igualzinho ao que fizemos com os `campos[linha][coluna].setText(...)` "na unha" do Sudoku, Parte 2: funciona, mas qualquer coisa além do título (cor, ícone, cards) vai exigir repetir a mesma estrutura três vezes.

### Glossário — Parte 1

| Termo | Significado |
|---|---|
| **`display: flex`** | Modo de layout CSS que organiza os elementos filhos em uma linha (ou coluna) flexível. |

### 🧪 Teste rápido

Você deve ver três caixas cinza-claras lado a lado, cada uma com um título ("A Fazer", "Em Andamento", "Concluído").

---

## Parte 2 — Os primeiros cards "na unha"

### A mentalidade desta parte

Colunas prontas, agora quero ver cards de verdade dentro delas — copiando o que aparece no print do Gemini: um título em negrito, uma etiqueta colorida, talvez uma descrição.

### O código

`src/app/app.html`:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    <div class="card">
      <span class="tag tag-profissional">Profissional</span>
      <strong>Concluir E-commerce Portfolio</strong>
    </div>
    <div class="card">
      <span class="tag tag-estudos">Estudos</span>
      <strong>O'Reilly Java Learning Path</strong>
    </div>
  </div>
  <div class="column">
    <h2>Em Andamento</h2>
    <div class="card">
      <span class="tag tag-github">Github</span>
      <strong>Finalizar Debugging Design Patterns</strong>
    </div>
  </div>
  <div class="column">
    <h2>Concluído</h2>
    <div class="card">
      <span class="tag tag-profissional">Profissional</span>
      <strong>Melhorar Apresentação Perfil Github</strong>
    </div>
  </div>
</div>
```

`src/app/app.scss`:

```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.tag { display: inline-block; font-size: 0.7rem; color: white; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
.tag-profissional { background: #7e57c2; }
.tag-estudos { background: #43a047; }
.tag-github { background: #29b6f6; }
```

### Explicando

- Cada `.card` foi digitado à mão, dentro da coluna certa, exatamente como colamos `campos[0][2].setText("9")` uma dica por vez no Sudoku, Parte 2.
- As classes `tag-profissional`, `tag-estudos`, `tag-github` também foram criadas "na unha", uma por etiqueta que precisamos agora — sem nenhuma lista central de quais etiquetas existem.

### Uma pausa para reconhecer o problema

Funciona, e já começa a parecer o print do Gemini. Mas repare no que já dói:

- Para adicionar um card novo, preciso copiar um bloco `<div class="card">...</div>` inteiro e colar na coluna certa, torcendo para não errar a indentação.
- Não existe, em nenhum lugar do código, a ideia de "um card" — só existe HTML repetido. Se eu quiser, por exemplo, contar quantos cards existem, ou mover um card de coluna, não há nada que eu possa perguntar ou mandar fazer — só copiar/colar/apagar texto.
- Cada nova etiqueta de cor exige uma nova classe CSS `tag-*`, escrita à mão.

Isso é o mesmo cheiro de código do Sudoku Parte 2: nada está tecnicamente errado, mas a repetição e a fragilidade já denunciam que falta estrutura. Ainda não vamos resolver — só reconhecer.

### Glossário — Parte 2

| Termo | Significado |
|---|---|
| **`box-shadow`** | Propriedade CSS que desenha uma sombra ao redor de um elemento, aqui usada para dar profundidade ao card. |
| **Code smell (cheiro de código)** | Ver `metodologia_design_emergente.md` — sintoma estrutural, não um erro técnico. |

### 🧪 Teste rápido

Você deve ver os cards de exemplo aparecendo dentro das colunas certas, cada um com uma etiqueta colorida acima do título.

---

## Parte 3 — Um array de cards, e o primeiro `@for`

### A mentalidade desta parte

Copiar `<div class="card">` à mão não escala — se eu quiser 10 cards, seriam 10 blocos idênticos. O jeito mais direto de resolver isso, sem ainda pensar em classe nenhuma, é guardar os cards num **array de objetos**, dentro do próprio componente, e deixar o Angular repetir o HTML pra mim com `@for`.

### O código

`src/app/app.ts`:

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

`src/app/app.html`:

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

### Explicando

- `cards = [...]` — um único array de **objetos literais** (ainda não uma classe/interface — nem sabemos se vai precisar de uma), cada um com `titulo`, `etiqueta` e `coluna`. É o equivalente direto aos arrays paralelos `esperado[][]` e `fixo[][]` do Sudoku, Parte 3: dados crus, sem comportamento, viajando juntos "na mão".
- `@for (c of cards; track c) { @if (...) { ... } }` — repetido **três vezes**, uma por coluna, cada vez percorrendo o array **inteiro** e filtrando com um `@if` dentro do bloco.
- `track c` — como os objetos ainda não têm um identificador próprio (isso só chega na Parte 7), usamos o próprio objeto como chave de identidade. Funciona bem aqui porque o array `cards` nunca é recriado do zero — só editado no lugar.

### Uma pausa para reconhecer o problema

- O mesmo array é percorrido **três vezes** (uma por coluna) — a mesma dor da regra dos três (gatilho `#2` do catálogo): a lógica de "filtrar por coluna" está prestes a ter sido escrita de formas ligeiramente diferentes se eu não prestar atenção.
- `titulo`, `etiqueta` e `coluna` sempre viajam juntos, dentro do mesmo objeto — isso já é bom (melhor que arrays paralelos separados!), mas o "card" ainda é um objeto anônimo, sem nome de tipo, sem nenhuma garantia de que todo item do array vai ter exatamente esses três campos.
- E o título da coluna ("A Fazer", "Em Andamento", "Concluído") está espalhado em dois lugares: no `<h2>` fixo e na string usada para comparar (`'A_FAZER'`) — se eu digitar errado uma das duas, o bug é silencioso.
- Repetir `@for (c of cards; track c) { @if (...) { ... } }` três vezes já é visualmente mais pesado do que valeria a pena — um sinal a mais de que uma filtragem centralizada (Parte 4) vale a pena.

### Glossário — Parte 3

| Termo | Significado |
|---|---|
| **`@for` / `track`** | Ver o primer de sintaxe, no início do documento. |
| **Objeto literal** | Um valor `{ campo: valor, ... }` criado sem uma classe/interface nomeada por trás. |

### 🧪 Teste rápido

Você deve ver exatamente os mesmos 4 cards de antes, cada um na coluna correta — só que agora vindos de um array, não mais copiados à mão no HTML.

---

## Parte 4 — Extraindo `Card` e um único `@for` por coluna com `filter`

### A mentalidade desta parte

Dois sintomas do catálogo apareceram juntos na Parte 3: o gatilho `#1` (dados que sempre viajam juntos → merecem um tipo) e o gatilho `#2` (a mesma lógica de filtro, repetida três vezes, prestes a ficar inconsistente). Hora de nomear o "card" como um tipo de verdade, e resolver a filtragem uma única vez por coluna.

### Criando o modelo `Card`

Crie `src/app/models/card.ts`:

```typescript
export interface Card {
  titulo: string;
  etiqueta: string;
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}
```

### Refatorando o componente

`src/app/app.ts`:

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

`src/app/app.html`:

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

### Explicando

- `interface Card` — nomeia, pela primeira vez, o conceito de "card" (gatilho `#1`: título e etiqueta e coluna sempre viajavam juntos → agora têm um nome e um contrato). O tipo `'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'` (um *union type* de strings literais) já impede, em tempo de compilação, que alguém escreva `'A_FASER'` por engano — um ganho pequeno, mas real, sobre a Parte 3.
- `porColuna(coluna)` — a lógica de filtro passou a existir **uma única vez** (gatilho `#2` resolvido), e é chamada três vezes, mas a lógica em si não está duplicada — cada chamada só passa um parâmetro diferente. O `@if` que existia dentro de cada `@for` na Parte 3 desapareceu: cada bloco já recebe só os itens certos.

### Glossário — Parte 4

| Termo | Significado |
|---|---|
| **`interface`** (TypeScript) | Contrato que descreve a forma de um objeto — quais campos existem e de que tipo — sem gerar código em tempo de execução. |
| ***Union type* de strings literais** | Tipo formado pela união de valores string específicos (aqui, `'A_FAZER'` \| `'EM_ANDAMENTO'` \| `'CONCLUIDO'`), restringindo o valor a um desses três. |
| **`Array.prototype.filter`** | Método que devolve um novo array contendo apenas os elementos que satisfazem uma condição. |

### 🧪 Teste rápido

Comportamento visual idêntico ao da Parte 3.

---

## Parte 5 — Extraindo o componente de card (baixa coesão do `App`)

### A mentalidade desta parte

O `App` já faz várias coisas sem relação direta entre si: monta a lista de cards, decide o layout das três colunas, e decide como cada card individual se parece (tag, título, sombra). É o mesmo sintoma do `main()` do Sudoku na Parte 6/8 — gatilho `#3` do catálogo: "difícil descrever o que a classe faz em uma frase sem usar 'e'". Hora de dar ao card seu próprio componente.

### Um cuidado de nome antes de começar

Se você criasse este componente com `ng generate component card`, o CLI nomearia a classe gerada simplesmente `Card` — seguindo a mesma convenção "sem sufixo" que já vimos em `App`. O problema: já existe um `Card`, a **interface** de domínio que criamos na Parte 4! Duas coisas diferentes com o mesmo nome no mesmo projeto é uma receita para confusão (e para um `import` errado a qualquer momento). Por isso, aqui criamos o componente manualmente, com um nome que não colide: `CardItemComponent`.

### Criando o componente

`src/app/card-item/card-item.ts`:

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

`src/app/card-item/card-item.html`:

```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
</div>
```

`src/app/card-item/card-item.scss`:

```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
```

### Refatorando o `App`

`src/app/app.ts`:

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

`src/app/app.html`:

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

`src/app/app.scss` perde as regras `.card`/`.tag`, que migraram para `card-item.scss`:

```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
```

### Explicando

- `@Input({ required: true }) card!: Card;` — declara que `CardItemComponent` **recebe** um `Card` de fora; o `required: true` faz o compilador reclamar se algum uso esquecer de passar `[card]`.
- `imports: [CardItemComponent]` no `@Component` de `App` — diferente de versões antigas do Angular, onde um `NgModule` central resolvia isso, aqui **cada componente lista explicitamente** quais outros componentes usa no seu template. `App` agora declara que usa `CardItemComponent`.
- `<app-card-item [card]="c" />` — o `App` não sabe mais **como** um card se parece visualmente, só sabe que existe um card e delega o resto. Exatamente a mesma divisão de responsabilidade que trouxemos para o Sudoku (Parte 5): o componente pai encolhe, o componente novo absorve a complexidade visual. (A sintaxe `<tag />` com barra de fechamento — em vez de `<tag></tag>` — é apenas um atalho HTML para elementos sem filhos; funciona igual.)
- Repare que isso é uma extração **puramente estrutural** por enquanto — nenhum comportamento novo nasceu, só uma reorganização motivada pelo gatilho `#3`.

### Glossário — Parte 5

| Termo | Significado |
|---|---|
| **`@Input()`** | Decorator que marca uma propriedade de um componente como recebível de fora, via *data binding*. |
| **`required: true`** (em `@Input`) | Flag que torna obrigatório passar aquele input; o compilador Angular avisa em tempo de build se faltar. |
| **Componente filho / componente pai** | Relação entre um componente que é usado dentro de outro (`app-card-item` dentro de `app-root`) e recebe dados dele via `@Input`. |

### 🧪 Teste rápido

Comportamento visual idêntico às partes anteriores. Se você alterar o estilo dentro de `card-item.scss`, o efeito deve aparecer sem tocar em `app.ts`/`app.html` — confirmando que a responsabilidade de fato migrou.

---

## Parte 6 — Arrastar e soltar entre colunas (Angular CDK)

### A mentalidade desta parte

Um Kanban parado, sem arrastar-e-soltar, não é um Kanban — é uma lista em três colunas. Esse é o próximo requisito visível e óbvio, olhando o print do Gemini.

### Instalando o Angular CDK

```bash
npm install @angular/cdk
```

### Reestruturando os dados por coluna (em vez de um `filter` a cada render)

Manter um único array e filtrar a cada renderização funcionava até aqui, mas o `DragDropModule` do CDK espera receber **uma lista por container de drop**, e precisa conseguir mover itens **entre** essas listas diretamente. Isso empurra a estrutura de dados para três arrays (um por coluna) em vez de um array só com um campo `coluna`:

`src/app/app.ts`:

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

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }
}
```

`src/app/app.html`:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    <div cdkDropList [cdkDropListData]="aFazer" [cdkDropListConnectedTo]="['emAndamento','concluido']"
         id="aFazer" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of aFazer; track c) {
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

`src/app/app.scss` ganha uma regra a mais:

```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
.dropzone { min-height: 80px; }
```

### Explicando

- `cdkDropList` / `cdkDrag` — diretivas do CDK que transformam um container em uma "zona de soltar" e cada filho em um item "arrastável".
- `[cdkDropListConnectedTo]` — sem isso, cada `cdkDropList` só aceitaria itens soltos dentro dela mesma; conectar as três é o que permite mover um card **entre** colunas.
- `moveItemInArray` / `transferArrayItem` — funções utilitárias do CDK: a primeira reordena dentro do mesmo array (arrastar para cima/baixo na mesma coluna); a segunda move um item de um array para outro (mudar de coluna).
- `imports: [CardItemComponent, DragDropModule]` — `App` agora declara duas dependências de template: o componente de card e o módulo do CDK que fornece `cdkDropList`/`cdkDrag`.
- Note que o campo `coluna` de cada `Card` **não é atualizado** por este código — ele só reflete de onde o card veio originalmente. Isso ainda não dói (nada consome esse campo agora), mas é uma inconsistência que vamos precisar resolver assim que alguma outra parte do sistema passar a confiar nesse campo — guarde essa observação para a Parte 9.

### Uma pausa para reconhecer o problema

Passamos de "um array com um campo `coluna`" (Parte 4) para "três arrays, um por coluna" (aqui) — uma escolha motivada puramente pela API do CDK, não por um gatilho do catálogo. Isso é importante registrar no seu LOG: nem toda mudança estrutural nasce de um code smell — às vezes ela nasce de uma restrição de uma biblioteca externa, e tudo bem.

### Glossário — Parte 6

| Termo | Significado |
|---|---|
| **Angular CDK** (*Component Dev Kit*) | Biblioteca oficial do Angular com comportamentos de UI reutilizáveis (drag-and-drop, overlay, etc.), sem estilo visual imposto. |
| **`cdkDropList`** | Diretiva que marca um elemento como zona válida para soltar itens arrastáveis. |
| **`cdkDrag`** | Diretiva que torna um elemento arrastável dentro de uma `cdkDropList`. |
| **`CdkDragDrop<T>`** | Tipo do evento emitido ao soltar um item, contendo containers de origem/destino e índices. |

### 🧪 Teste rápido

Arraste um card de "A Fazer" para "Em Andamento" — ele deve se mover visualmente e permanecer lá. Arraste um card para cima/baixo dentro da mesma coluna — a ordem deve mudar. Recarregue a página (F5) — tudo deve voltar ao estado inicial (ainda não temos persistência; isso é esperado e vamos sentir essa dor daqui a pouco).

---
## Parte 7 — Adicionando e removendo cards (e o problema do ID)

### A mentalidade desta parte

Um Kanban sem conseguir criar uma tarefa nova não serve para nada. Vamos adicionar um campo de texto e um botão "+" por coluna, além de um botão de remover em cada card, no mesmo espírito do print do Gemini.

### O problema que aparece imediatamente

Assim que escrevemos a primeira função `remover(card)`, uma pergunta simples trava a implementação: **remover qual card, exatamente?** Se dois cards tiverem o mesmo título (perfeitamente possível — "Refatorar README" aparece duas vezes no seu próprio board real), comparar por `titulo` vai remover ou mover o card errado. Isso é o gatilho `#9` do catálogo: travar para nomear/identificar algo geralmente significa que a responsabilidade daquele elemento ainda não está bem definida — aqui, falta um **identificador único** por card.

### Arquivos alterados nesta etapa

Sete arquivos são tocados: `models/card.ts` (novo campo `id`), os três arquivos de `card-item/` (novo botão de remover) e os três arquivos de `app` na raiz de `src/app/` (novo campo de criação, tracking por `id`, e ligação do evento de remover).

`src/app/models/card.ts` — substitua todo o conteúdo por:

```typescript
export interface Card {
  id: string;
  titulo: string;
  etiqueta: string;
}
```

(O campo `coluna`, que existia até a Parte 5, já havia sido removido — desde a Parte 6, qual coluna um card pertence é expresso por **em qual dos três arrays** ele está, não por um campo redundante dentro dele.)

`src/app/card-item/card-item.ts` — substitua todo o conteúdo por:

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
  @Output() remover = new EventEmitter<Card>();
}
```

`src/app/card-item/card-item.html` — substitua todo o conteúdo por:

```html
<div class="card">
  <span class="tag">{{ card.etiqueta }}</span>
  <strong>{{ card.titulo }}</strong>
  <button class="remover" (click)="remover.emit(card)">×</button>
</div>
```

`src/app/card-item/card-item.scss` — substitua todo o conteúdo por:

```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); position: relative; }
.tag { display: inline-block; font-size: 0.7rem; color: white; background: #7e57c2; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; }
.remover { position: absolute; top: 0.5rem; right: 0.5rem; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #999; }
```

`src/app/app.ts` — substitua todo o conteúdo por:

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

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    coluna.push({ id: crypto.randomUUID(), titulo, etiqueta: 'Geral' });
  }

  remover(coluna: Card[], card: Card) {
    const index = coluna.indexOf(card);
    if (index >= 0) coluna.splice(index, 1);
  }
}
```

`src/app/app.html` — substitua todo o conteúdo por:

```html
<h1>Kanban</h1>
<div class="board">
  <div class="column">
    <h2>A Fazer</h2>
    <div cdkDropList [cdkDropListData]="aFazer" [cdkDropListConnectedTo]="['emAndamento','concluido']"
         id="aFazer" (cdkDropListDropped)="drop($event)" class="dropzone">
      @for (c of aFazer; track c.id) {
        <app-card-item [card]="c" cdkDrag (remover)="remover(aFazer, $event)" />
      }
    </div>
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

`src/app/app.scss` — substitua todo o conteúdo por:

```scss
.board { display: flex; gap: 1rem; padding: 1rem; }
.column { background: #eee; border-radius: 8px; padding: 1rem; width: 260px; }
.dropzone { min-height: 80px; }
.nova-tarefa { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.nova-tarefa input { flex: 1; min-width: 0; }
```

### Explicando

- `crypto.randomUUID()` — API nativa do navegador que gera um identificador único (UUID v4), sem precisar de nenhuma biblioteca externa. Resolve o gatilho `#9`: agora cada card tem uma identidade própria, independente do seu conteúdo.
- `coluna.indexOf(card)` — funciona por **igualdade de referência** (o mesmo objeto JavaScript), não por conteúdo. Voltamos a usar `id` de propósito, porque o backend (Parte 8 em diante) não vai ter como comparar por referência de objeto, só por `id`.
- `track c.id` (no lugar de `track c`) — agora que existe um identificador estável, é a escolha correta: o Angular consegue reconhecer "o mesmo card" mesmo que o array seja reordenado ou parcialmente substituído, sem recriar o DOM à toa. Isso vai importar de verdade a partir da Parte 9, quando a lista passa a ser recarregada do backend a cada mudança.
- `@Output() remover = new EventEmitter<Card>()` — o mecanismo inverso do `@Input()` que já usamos: permite que `CardItemComponent`, um componente filho, emita um evento para o seu componente pai. `remover.emit(card)`, disparado ao clicar no botão "×", envia o próprio card clicado como dado do evento.
- `(remover)="remover(aFazer, $event)"` — no template de `App`, a sintaxe de parênteses liga o evento customizado `remover` (emitido por `CardItemComponent`) ao método `remover` de `App`. `$event` é o valor emitido pelo `EventEmitter`, neste caso o próprio `Card` removido. Note que o componente filho e o método do componente pai têm o mesmo nome (`remover`); isso é apenas coincidência de nomenclatura, não um requisito da sintaxe.
- Três nomes distintos de variável de referência de template (`#novoTituloAFazer`, `#novoTituloEmAndamento`, `#novoTituloConcluido`), em vez de reaproveitar o mesmo nome nas três colunas: variáveis de referência de template (`#nome`) têm escopo em todo o arquivo de template, não apenas dentro do elemento onde são declaradas. Declarar `#novoTitulo` três vezes no mesmo arquivo `app.html` resultaria em erro de compilação, por ambiguidade de referência.

### Glossário — Parte 7

| Termo | Significado |
|---|---|
| **UUID** (*Universally Unique Identifier*) | Identificador de 128 bits, praticamente garantido como único, usado aqui para distinguir cards com o mesmo título. |
| **`@Output()` / `EventEmitter`** | Decorator e classe (complementares ao `@Input()`) que permitem a um componente filho emitir eventos customizados para o componente pai. |
| **Variável de referência de template (`#nome`)** | Identificador declarado em um elemento HTML do template, com escopo em todo o arquivo, usado para acessar aquele elemento (ou seu valor) em outra parte do mesmo template. |
| **Igualdade de referência vs. igualdade de conteúdo** | Comparar `a === b` (mesmo objeto na memória) é diferente de comparar se dois objetos têm os mesmos campos/valores. |

### 🧪 Teste rápido

Digite um título em qualquer uma das três colunas e clique em "+" — um novo card deve aparecer nessa coluna, com a etiqueta "Geral". Clique no botão "×" de um card — ele deve desaparecer imediatamente. Crie dois cards com o **mesmo título** e remova só um deles — confirme que o card certo (e só ele) foi removido.

---

## Parte 8 — A dor do F5: nasce o backend

### A mentalidade desta parte

Toda a Parte 7 funciona lindamente — até você apertar F5. Tudo some. Essa é uma dor concreta, sentida na pele, não uma antecipação hipotética — exatamente o tipo de motivação que o Design Emergente pede antes de qualquer nova camada. A resposta é um backend que guarde o estado fora do navegador.

Voltando ao paralelo com o Sudoku: esta parte é o equivalente ao momento em que o tutorial clássico introduziria a primeira classe de domínio — só que aqui a "primeira classe" mora num processo Java totalmente separado, falando com o navegador por HTTP.

### Criando o projeto Spring Boot

Via [Spring Initializr](https://start.spring.io/) (ou seu equivalente na IDE):

- **Project:** Maven
- **Language:** Java 21
- **Spring Boot:** versão estável mais recente
- **Dependencies (por agora, só uma):** `Spring Web`

> 💡 A partir do Spring Boot 4, essa dependência é empacotada sob o artefato `spring-boot-starter-webmvc` (renomeado a partir do antigo `spring-boot-starter-web`, usado em versões anteriores do framework). O checkbox "Spring Web" no Spring Initializr já seleciona o artefato correto para a versão instalada; a mudança de nome só importa se você for editar o `pom.xml` manualmente, o que acontece pela primeira vez na Parte 12.
- **Group:** `com.github.ahaerdy`, **Artifact:** `backend`

> 💡 Ao criar o projeto no IntelliJ (ou ao extrair o `.zip` baixado do Spring Initializr), salve/extraia diretamente dentro de `projeto/backend/` no seu repositório — mantendo o `Artifact` também como `backend` deixa o nome do projeto e o nome da pasta consistentes.

### O que é uma anotação Java, mecanicamente

Antes de ver as anotações específicas usadas no código abaixo, vale entender o que uma anotação **é**, de fato, e o que ela faz por trás dos panos — isso vale para toda anotação Java que vai aparecer daqui até o final do tutorial, não só as desta Parte.

Uma **anotação** (`@Algo`) é um pedaço de metadado anexado a uma classe, método, campo ou parâmetro, sem alterar o comportamento do código em tempo de compilação por si só. Sozinha, uma anotação não faz nada: `@GetMapping("/cards")` colocada acima de um método não altera em nada a lógica desse método. O que de fato produz comportamento é **outro código**, em algum lugar (aqui, o próprio Spring), que **lê** essas anotações em tempo de execução, usando um mecanismo do Java chamado **reflexão** (*reflection*, a capacidade de um programa inspecionar suas próprias classes, métodos e anotações enquanto roda), e decide o que fazer com base no que encontrou.

No caso do Spring Boot, especificamente: ao subir, a aplicação varre (*component scan*) os pacotes do projeto à procura de classes marcadas com certas anotações (`@RestController`, `@Service`, que veremos na Parte 10, entre outras), e usa reflexão para: instanciar essas classes automaticamente, inspecionar seus métodos em busca de anotações de rota (`@GetMapping`, `@PostMapping`, etc.) e registrar, internamente, qual método deve responder a qual combinação de URL e verbo HTTP. Nada disso é mágica: é reflexão mais um enorme conjunto de convenções decididas pela equipe do Spring — e é exatamente por isso que a ordem de leitura de uma classe anotada costuma ser "de fora para dentro": primeiro entender que anotação está ali, depois o que ela declara, e só então o corpo do método, que é só a lógica de negócio pura, sem nenhuma referência explícita a HTTP, rotas ou serialização.

> Isso conecta diretamente com os *decorators* do TypeScript/Angular, já vistos no primer de sintaxe no início deste documento: a ideia de "metadado interpretado por um framework em tempo de execução" é essencialmente a mesma nos dois ecossistemas — só o mecanismo interno muda (reflexão no Java, funções decorator explícitas no TypeScript).

### Arquivo criado nesta etapa

`src/main/java/com/github/ahaerdy/backend/BackendApplication.java` — crie com o seguinte conteúdo (a classe de controller, `CardController`, foi colocada no mesmo arquivo apenas nesta etapa inicial, por simplicidade; ela ganha um arquivo próprio na Parte 10):

```java
package com.github.ahaerdy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}

@RestController
class CardController {

    @GetMapping("/cards")
    public List<Map<String, String>> listar() {
        return List.of(
            Map.of("id", "1", "titulo", "Concluir E-commerce Portfolio", "etiqueta", "Profissional", "coluna", "A_FAZER"),
            Map.of("id", "2", "titulo", "Finalizar Debugging Design Patterns", "etiqueta", "Github", "coluna", "EM_ANDAMENTO")
        );
    }
}
```

### Explicando

- `@SpringBootApplication` — na prática, uma anotação "guarda-chuva": ela mesma é composta por outras três anotações menores (`@Configuration`, `@EnableAutoConfiguration` e `@ComponentScan`), combinadas numa só para conveniência. `@ComponentScan` é quem diz ao Spring "varra este pacote e todos os seus subpacotes à procura de classes anotadas para gerenciar"; `@EnableAutoConfiguration` é quem decide, com base nas dependências presentes no `pom.xml`, configurar automaticamente um servidor Tomcat embutido, um conversor JSON, etc., sem exigir XML nem configuração manual. É o equivalente, em espírito, ao `setVisible(true)` do Sudoku: sem ela, nada sobe.
- `@RestController` — também uma composição: por trás dela, existem duas anotações menores, `@Controller` (que registra a classe como um componente gerenciado, participante do *component scan* mencionado acima) e `@ResponseBody` (que diz ao Spring para serializar o retorno de cada método diretamente no corpo da resposta HTTP, como JSON, em vez de tratá-lo como o nome de uma página HTML a renderizar — o comportamento padrão de `@Controller` sozinho, usado em aplicações que geram HTML no servidor, fora do escopo deste projeto).
- `@GetMapping("/cards")` — um atalho para `@RequestMapping(value = "/cards", method = RequestMethod.GET)`: associa o método `listar()` especificamente a requisições HTTP do verbo `GET` na rota `/cards`. Voltamos a esse conjunto de anotações de rota, com mais detalhe, na Parte 11, quando os outros verbos HTTP (`POST`, `PUT`, `DELETE`) entrarem em cena.
- O retorno é uma `List<Map<String, String>>` **hardcoded**, dados escritos diretamente dentro do próprio método, de propósito. Igual ao `Main` do Sudoku, Parte 0/2: ainda não sabemos o suficiente sobre o domínio (vai ter banco? quantos campos um card realmente precisa?) para justificar criar uma classe `Card` em Java agora.

### Glossário — Parte 8

| Termo | Significado |
|---|---|
| **Spring Boot** | Framework Java que simplifica a criação de aplicações standalone, incluindo um servidor HTTP embutido. |
| **Anotação** (*annotation*) | Metadado anexado a uma classe, método, campo ou parâmetro Java, lido em tempo de execução por outro código (aqui, o Spring) por meio de reflexão, para decidir comportamento. |
| **Reflexão** (*reflection*) | Capacidade de um programa Java inspecionar, em tempo de execução, suas próprias classes, métodos e anotações. |
| **Varredura de componentes** (*component scan*) | Processo em que o Spring examina os pacotes do projeto à procura de classes anotadas para gerenciar automaticamente. |
| **`@RestController`** | Anotação Spring, composta por `@Controller` + `@ResponseBody`, que marca uma classe como controlador REST, serializando os retornos dos métodos como JSON por padrão. |
| **`@GetMapping`** | Atalho de `@RequestMapping` que mapeia um método Java para requisições HTTP `GET` em uma rota específica. |
| **Maven** | Ferramenta de build e gerenciamento de dependências para projetos Java. |

### 🧪 Teste rápido

Rode `BackendApplication` (ou `mvn spring-boot:run`). Acesse `http://localhost:8080/cards` no navegador — você deve ver um JSON com os dois cards de exemplo.

---

## Parte 9 — Conectando o Angular ao backend (e a primeira dor de CORS)

### A mentalidade desta parte

Backend respondendo, frontend com dados hardcoded — hora de fazer os dois se falarem. O frontend ainda mantém os métodos `adicionar`/`remover`/`drop` operando localmente, sem persistir no servidor — essa ligação chega na Parte 11. Por enquanto, resolvemos só a leitura inicial dos dados.

### Arquivos alterados nesta etapa

`src/app/app.config.ts` — substitua todo o conteúdo por:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
  ]
};
```

`src/app/app.ts` — substitua todo o conteúdo por:

```typescript
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';

interface CardApi extends Card {
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  aFazer: Card[] = [];
  emAndamento: Card[] = [];
  concluido: Card[] = [];

  ngOnInit() {
    this.http.get<CardApi[]>('http://localhost:8080/cards').subscribe(cards => {
      this.aFazer = cards.filter(c => c.coluna === 'A_FAZER');
      this.emAndamento = cards.filter(c => c.coluna === 'EM_ANDAMENTO');
      this.concluido = cards.filter(c => c.coluna === 'CONCLUIDO');
      this.cdr.markForCheck();
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    coluna.push({ id: crypto.randomUUID(), titulo, etiqueta: 'Geral' });
  }

  remover(coluna: Card[], card: Card) {
    const index = coluna.indexOf(card);
    if (index >= 0) coluna.splice(index, 1);
  }
}
```

`src/app/app.html` não é alterado nesta etapa: continua exatamente como ficou ao final da Parte 7.

`src/main/java/com/github/ahaerdy/backend/BackendApplication.java` — a classe `CardController`, dentro desse mesmo arquivo, ganha uma anotação nova. Localize a classe `CardController` e ajuste apenas a linha de anotações, deixando o restante do arquivo (incluindo `BackendApplication`) inalterado:

```java
@RestController
@CrossOrigin(origins = "http://localhost:4200")
class CardController {

    @GetMapping("/cards")
    public List<Map<String, String>> listar() {
        return List.of(
            Map.of("id", "1", "titulo", "Concluir E-commerce Portfolio", "etiqueta", "Profissional", "coluna", "A_FAZER"),
            Map.of("id", "2", "titulo", "Finalizar Debugging Design Patterns", "etiqueta", "Github", "coluna", "EM_ANDAMENTO")
        );
    }
}
```

Não esqueça de adicionar o `import` correspondente no topo do arquivo:

```java
import org.springframework.web.bind.annotation.CrossOrigin;
```

### A dor imediata: CORS

Rodando os dois (`ng serve` na porta 4200, Spring Boot na porta 8080) e recarregando o Angular, antes de adicionar `@CrossOrigin`, o console do navegador mostra um erro de **CORS** (*Cross-Origin Resource Sharing*): o navegador bloqueia, por segurança, uma página servida em `localhost:4200` de chamar livremente `localhost:8080`, a menos que o backend explicitamente autorize.

### A segunda dificuldade, menos óbvia: a tela não atualiza sozinha

Depois de resolver o CORS, é comum notar que os cards ainda não aparecem na tela, mesmo com a resposta do backend chegando corretamente (confirmável com um `console.log(cards)` dentro do `subscribe`: os dados chegam certos, as três variáveis são atribuídas certas, e mesmo assim a interface permanece vazia). Isso não é um erro no código, é uma característica desta versão do Angular que vale entender antes de seguir.

Em versões mais antigas do Angular, uma biblioteca chamada **Zone.js** interceptava automaticamente qualquer operação assíncrona do navegador (temporizadores, eventos, requisições de rede) e avisava o Angular: "algo pode ter mudado, verifique a tela de novo". A partir da versão usada neste tutorial, o Angular passou a ser **zoneless por padrão**: o projeto gerado pelo `ng new` não inclui mais o Zone.js (confirme, se quiser, que `zone.js` não aparece no `package.json` nem em `angular.json`, na chave `polyfills`). Sem essa biblioteca fazendo a verificação automática, o Angular só sabe que precisa atualizar a tela em situações específicas e explícitas:

- o valor de um *signal* lido no template mudou;
- o `AsyncPipe` (`| async`) recebeu uma nova emissão de um `Observable`;
- um evento vinculado diretamente no template (`(click)`, `(cdkDropListDropped)`, etc.) terminou de executar;
- `ChangeDetectorRef.markForCheck()` foi chamado manualmente.

O método `drop()`, mais adiante neste mesmo arquivo, continua funcionando sem nenhum ajuste porque é chamado diretamente por um evento de template (`(cdkDropListDropped)="drop($event)"`), o que já está na lista acima. Já o código dentro de `.subscribe(cards => ...)`, em `ngOnInit`, roda de forma assíncrona, **depois** que o método já terminou de executar: nenhuma das quatro situações citadas acontece ali, então o Angular nunca é avisado de que `aFazer`, `emAndamento` e `concluido` mudaram, mesmo que a atribuição tenha ocorrido normalmente.

A correção mais simples, sem reescrever o projeto inteiro para usar *signals* (uma alternativa mais moderna, mas fora do escopo deste tutorial), é injetar `ChangeDetectorRef` e chamar `markForCheck()` manualmente logo após a atribuição, avisando o Angular de que este componente precisa ser verificado de novo — é exatamente o que a linha `this.cdr.markForCheck();`, já incluída no código acima, faz.

### Explicando

- `app.config.ts` — arquivo central de configuração da aplicação (equivalente, em espírito, a onde um `NgModule` registraria `providers` em versões mais antigas do Angular). `provideBrowserGlobalErrorListeners()` já vinha do `ng new`; adicionamos `provideHttpClient()` ao lado.
- `provideHttpClient()` — registra o serviço `HttpClient` do Angular para toda a aplicação; sem isso, `inject(HttpClient)` falharia.
- `interface CardApi extends Card { coluna: ... }` — a resposta HTTP do backend inclui um campo `coluna` (usado apenas para saber em qual array cada card deve entrar), mas esse campo não faz parte do modelo `Card` do domínio do frontend, removido dele na Parte 7. Em vez de reintroduzir `coluna` na interface `Card` (o que reabriria o mesmo problema de duplicação de informação resolvido naquela etapa), criamos um tipo `CardApi` específico para representar o formato exato da resposta da API, usado apenas dentro de `ngOnInit`.
- `inject(HttpClient)` — forma moderna de obter uma dependência dentro de um componente, alternativa ao construtor tradicional.
- `inject(ChangeDetectorRef)` / `markForCheck()` — conforme explicado acima, avisa manualmente o Angular de que o componente precisa ser reavaliado, suprindo a ausência do Zone.js para esta atualização específica, disparada de dentro de um callback assíncrono.
- `.subscribe(cards => ...)` — chamadas HTTP no Angular são **assíncronas** e modeladas como `Observable` (do RxJS); `subscribe` é o que efetivamente "liga" a busca e reage quando a resposta chega.
- `@CrossOrigin(origins = "...")` — diferente das anotações vistas até aqui, esta não participa do roteamento de requisições: ela instrui o Spring a incluir, em toda resposta emitida por esse controlador, um cabeçalho HTTP específico (`Access-Control-Allow-Origin`), que é o que o navegador de fato verifica antes de permitir que o JavaScript da página leia a resposta. Sem esse cabeçalho, a requisição chega a ser enviada e até processada pelo backend, mas o navegador descarta a resposta silenciosamente do lado do cliente — por isso o erro de CORS aparece no console do navegador, não nos logs do backend. Numa aplicação em produção real, isso seria configurado de forma mais central e restrita, mas por ora essa anotação simples resolve o problema sem introduzir complexidade que ainda não é necessária.

### Glossário — Parte 9

| Termo | Significado |
|---|---|
| **`app.config.ts`** | Arquivo onde a aplicação registra seus provedores globais (serviços disponíveis em toda a árvore de componentes). |
| **`provideHttpClient()`** | Função que registra o serviço `HttpClient` do Angular. |
| **`HttpClient`** | Serviço do Angular para fazer requisições HTTP, baseado em `Observable`. |
| **`Observable`** (RxJS) | Representa um fluxo de valores assíncronos ao longo do tempo; precisa de `.subscribe()` para "começar a rodar". |
| **CORS** (*Cross-Origin Resource Sharing*) | Mecanismo de segurança do navegador que bloqueia, por padrão, requisições entre origens (domínio/porta) diferentes, a menos que o servidor autorize. |
| **`@CrossOrigin`** | Anotação Spring que autoriza requisições vindas de uma origem específica. |
| **Zone.js** | Biblioteca usada por versões mais antigas do Angular para interceptar operações assíncronas do navegador e disparar automaticamente a verificação de mudanças na tela. Ausente por padrão nesta versão do Angular. |
| **Zoneless** | Modo de operação do Angular (padrão nesta versão) em que a verificação de mudanças não é mais automática para qualquer operação assíncrona, dependendo de notificações explícitas (signals, `AsyncPipe`, eventos de template, ou `markForCheck()`). |
| **`ChangeDetectorRef.markForCheck()`** | Método que notifica manualmente o Angular de que um componente precisa ser reavaliado na próxima verificação de mudanças. |

### 🧪 Teste rápido

Com os dois processos rodando, recarregue `http://localhost:4200` — os cards exibidos inicialmente devem vir do backend (confirme alterando um `titulo` dentro de `CardController` e recarregando o Angular, sem tocar em nada do lado do frontend). Criar, mover e remover cards continua funcionando apenas localmente, sem refletir no backend — isso é esperado até a Parte 11.

---

## Parte 10 — Extraindo o domínio no backend: `Card` e `KanbanService`

### A mentalidade desta parte

O `CardController` já tem dois sintomas do catálogo acumulados: os `Map.of(...)` hardcoded estão prestes a ser copiados de novo assim que precisarmos de um segundo endpoint (gatilho `#2`), e a classe já mistura "representar um card" com "decidir a rota HTTP" (começo do gatilho `#3`). Hora de nomear o domínio, separando-o em três arquivos, cada um em seu próprio pacote.

### O padrão por trás dos três pacotes: arquitetura em camadas

Antes de ver o código, vale entender que essa separação em `model`, `service` e `web` não foi inventada especificamente para este projeto: ela é uma aplicação de um padrão de arquitetura bastante estabelecido, conhecido como **arquitetura em camadas** (*Layered Architecture*, também chamada de *N-Tier Architecture*). Formalizado por Martin Fowler no livro *Patterns of Enterprise Application Architecture* (2002), o padrão consiste em organizar o sistema em camadas horizontais, cada uma com uma responsabilidade distinta, onde uma camada só se comunica com a camada imediatamente abaixo dela.

No ecossistema Spring, essa é a convenção de organização mais comum para projetos de porte pequeno a médio (também chamada informalmente de *package by layer*, "pacote por camada", em contraste com a alternativa *package by feature*, "pacote por funcionalidade", mais comum em projetos maiores, onde cada módulo de negócio teria seu próprio pacote contendo suas próprias classes de model, service e controller juntas). Cada um dos três pacotes criados nesta etapa corresponde a uma camada clássica desse padrão:

| Pacote | Camada correspondente | Responsabilidade |
|---|---|---|
| `web` | Camada de apresentação (*Presentation Layer*) | Recebe requisições HTTP, traduz parâmetros de entrada, decide o formato da resposta. É o equivalente ao papel do `Controller` na sigla MVC (*Model-View-Controller*) — sem a parte de `View`, já que este backend não renderiza HTML, apenas devolve dados para o frontend consumir. |
| `service` | Camada de negócio (*Service Layer*, outro padrão nomeado por Fowler no mesmo livro) | Concentra as regras e decisões da aplicação (por exemplo, "todo card novo nasce na coluna A Fazer"), independente de como os dados chegam (HTTP, um futuro job agendado, um teste automatizado) ou de onde são guardados. |
| `model` | Camada de domínio (*Domain Layer* / *Domain Model*) | Representa os conceitos centrais do problema que o software resolve, como classes Java comuns, sem nenhuma dependência de como esses dados chegam ou são persistidos. |

Uma quarta camada, de persistência (*Data Source Layer* / *Repository*), ainda não existe: ela nasce na Parte 12, quando o armazenamento em memória for substituído por um banco de dados de verdade, e passa a viver em um quarto pacote, `repository`.

### O que significa "domínio" aqui

A palavra "domínio" usada no título desta Parte vem da mesma origem do nome do pacote `model`: o termo **domínio** (*domain*), no vocabulário de engenharia de software, designa a área de conhecimento ou o problema de negócio que o sistema resolve — aqui, o domínio é "gestão de tarefas em um quadro Kanban", e seus conceitos centrais são coisas como *card*, *coluna*, *etiqueta*. O uso mais influente desse termo vem do livro *Domain-Driven Design*, de Eric Evans (2003), que descreve o **modelo de domínio** (*domain model*) como a representação, em código, desses conceitos do mundo real — não como estruturas de dados genéricas (`Map`, `List<String>`), mas como classes com nome e significado próprios (`Card`).

"Nomear o domínio", portanto, não é uma etapa isolada do padrão de camadas: é exatamente o que acontece **dentro** da camada de domínio (pacote `model`) quando a classe `Card` é criada. Até a Parte 8, o "card" existia apenas como um `Map<String, String>` sem nome, sem validação, sem verificação alguma. A partir desta Parte, ele passa a ser um conceito de primeira classe no código: uma classe com nome, campos tipados e significado, que qualquer pessoa lendo o projeto reconhece imediatamente como o coração do domínio, independentemente de estar olhando para o pacote `service` ou `web`.

Vale registrar que `model` e `domain` são, na prática, nomes de pacote usados de forma intercambiável entre projetos Spring diferentes; o nome escolhido aqui (`model`) é uma convenção tão comum quanto `domain`, e ambos se referem exatamente à mesma camada e à mesma ideia.

### Arquivos criados nesta etapa

`src/main/java/com/github/ahaerdy/backend/model/Card.java` — arquivo novo:

```java
package com.github.ahaerdy.backend.model;

public class Card {

    private String id;
    private String titulo;
    private String etiqueta;
    private String coluna;

    public Card() {
    }

    public Card(String id, String titulo, String etiqueta, String coluna) {
        this.id = id;
        this.titulo = titulo;
        this.etiqueta = etiqueta;
        this.coluna = coluna;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getColuna() {
        return coluna;
    }

    public void setColuna(String coluna) {
        this.coluna = coluna;
    }
}
```

`src/main/java/com/github/ahaerdy/backend/service/KanbanService.java` — arquivo novo:

```java
package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class KanbanService {

    private final List<Card> cards = new CopyOnWriteArrayList<>(List.of(
        new Card(UUID.randomUUID().toString(), "Concluir E-commerce Portfolio", "Profissional", "A_FAZER"),
        new Card(UUID.randomUUID().toString(), "Finalizar Debugging Design Patterns", "Github", "EM_ANDAMENTO")
    ));

    public List<Card> listarTodos() {
        return cards;
    }
}
```

`src/main/java/com/github/ahaerdy/backend/web/CardController.java` — arquivo novo. A partir de agora, `CardController` deixa de morar dentro de `BackendApplication.java` e passa a ter seu próprio arquivo, em seu próprio pacote (`web`):

```java
package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/cards")
public class CardController {

    private final KanbanService service;

    public CardController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public List<Card> listar() {
        return service.listarTodos();
    }
}
```

### Arquivo alterado nesta etapa

`src/main/java/com/github/ahaerdy/backend/BackendApplication.java` — a classe `CardController`, que morava aqui desde a Parte 8, deve ser **removida** deste arquivo (seu conteúdo migrou para `web/CardController.java`, acima). O arquivo passa a conter apenas:

```java
package com.github.ahaerdy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

### Explicando

- `Card` (classe Java) — o equivalente direto ao `Space` do Sudoku, Parte 4: nasceu do gatilho `#1`, dados que sempre viajavam juntos (antes dentro de um `Map`), ganhando um nome e um tipo próprio.
- `@Service` — anotação que marca `KanbanService` como um componente gerenciado pelo Spring (*bean*), disponível para ser injetado em outras classes, aqui no `CardController`. Por padrão, o Spring cria **uma única instância** de cada bean (escopo *singleton*) e reutiliza essa mesma instância para todas as requisições, do início ao fim da execução do processo — é por isso que os cards criados numa requisição continuam visíveis nas requisições seguintes, mesmo sem banco de dados até a Parte 12.
- `CopyOnWriteArrayList` — uma lista pensada para cenários onde várias requisições podem ler/escrever ao mesmo tempo (cada requisição HTTP roda em sua própria thread); por ora, um detalhe de robustez que não muda nada do comportamento observável, só evita um problema futuro de concorrência que já sabemos, com certeza, que vai existir. A seção a seguir explica exatamente de onde vem esse risco.
- `public CardController(KanbanService service)` — **injeção de dependência via construtor**: o Spring, ao criar o `CardController`, percebe que ele precisa de um `KanbanService` e entrega automaticamente a instância gerenciada por ele.
- A separação em três pacotes (`model`, `service`, `web`) segue o padrão de arquitetura em camadas descrito na seção acima; não é obrigatória para um projeto deste tamanho, mas já estabelece uma convenção que vai se tornar mais útil conforme o número de classes cresce nas próximas etapas.
- O `CardController` agora só sabe **rotear**; toda a lógica de "quais cards existem" migrou para `KanbanService`. Isso resolve o gatilho `#3`: cada classe, uma responsabilidade.

### De onde vem, de fato, o risco de concorrência (e por que o Sudoku não tinha esse problema)

Vale entender com precisão de onde nasce o risco que `CopyOnWriteArrayList` está prevenindo, porque a resposta não é "o Spring é paralelo por padrão" — é o modelo de execução de qualquer servidor HTTP. O Tomcat embutido mantém um **pool de threads**: cada requisição que chega é atendida por uma thread desse pool, e threads diferentes podem, de fato, executar **ao mesmo tempo**, em núcleos de CPU diferentes — não é concorrência hipotética, é paralelismo real do sistema operacional.

Isso é mais fácil de acontecer do que parece, mesmo com um único desenvolvedor testando localmente: duas abas do navegador abertas na mesma página, um clique duplo no botão "+" antes da resposta anterior voltar, ou dois cards arrastados em sequência rápida — cada ação dispara uma requisição HTTP, e nada garante que a anterior já tenha terminado de ser processada no backend antes da próxima começar. Se `KanbanService` usasse um `ArrayList` comum (não pensado para concorrência), duas threads mexendo na mesma lista ao mesmo tempo — uma em `add()` enquanto outra está no meio de um `removeIf()`, ou o Jackson iterando a lista para montar a resposta JSON de um `GET` enquanto um `POST` insere um elemento — poderiam produzir um `ConcurrentModificationException`, corromper o array interno da lista, ou simplesmente perder uma escrita. `CopyOnWriteArrayList` resolve isso fazendo cada escrita (`add`, `remove`) criar uma cópia nova do array interno, trocada atomicamente, enquanto leituras nunca precisam esperar por nada.

**E por que o projeto do Sudoku, também em Java, não teve esse problema?** A resposta certa é mais específica do que "porque era desktop". A ausência de risco ali vem de uma decisão de design particular do Swing (e do JavaFX, se fosse o caso): **todo evento de interface — clique de botão, arrastar, o que for — é despachado numa única thread**, a *Event Dispatch Thread*. Como só existe uma thread tocando `Board`/`Space` em resposta a interações do usuário, não há como duas ações do usuário mexerem no mesmo dado ao mesmo tempo; a própria fila de eventos já serializa tudo, sem nenhum esforço extra do programador.

Duas ressalvas evitam levar essa conclusão longe demais:

1. **A segurança vem da thread única, não da linguagem nem de ser monólito.** Se aquele mesmo Sudoku ganhasse uma thread de segundo plano (um autosave periódico, uma sincronização de rede) que também tocasse `Board`, o mesmo risco reapareceria, ainda em Java, ainda desktop.
2. **A causa raiz é o que acontece quando o MVC atravessa a rede.** No Sudoku, Model, View e Controller vivem no mesmo processo, e o Controller (os `ActionListener` dos botões) só é acionado pela própria thread única da interface. Aqui no Kanban, `CardController` desempenha exatamente o mesmo papel de Controller no MVC, visto na seção sobre arquitetura em camadas — mas é acionado uma vez por requisição HTTP, de propósito em threads diferentes, porque é assim que um servidor web consegue atender vários clientes (várias `View`s completamente separadas, cada navegador rodando em seu próprio processo, potencialmente em máquinas diferentes) ao mesmo tempo. O padrão MVC, por si só, não determina nada sobre threads: quem decide isso é a plataforma que hospeda o Controller — uma janela Swing serializa tudo numa única thread; um servidor Tomcat, de propósito, paraleliza.

### Glossário — Parte 10

| Termo | Significado |
|---|---|
| **`@Service`** | Anotação Spring que marca uma classe como um componente de lógica de negócio, gerenciado pelo container do Spring. |
| **Injeção de dependência** | Padrão onde um objeto recebe suas dependências de fora (aqui, via construtor), em vez de criá-las ele mesmo. |
| **Bean** (Spring) | Um objeto cuja criação e ciclo de vida são gerenciados pelo container do Spring. |
| **Escopo *singleton*** | Configuração padrão de um bean Spring em que apenas uma instância é criada e compartilhada por toda a aplicação, durante toda a vida do processo. |
| **`CopyOnWriteArrayList`** | Implementação de `List` segura para acesso concorrente, otimizada para leituras frequentes e escritas raras. |
| **Arquitetura em camadas** (*Layered Architecture*) | Padrão de organização em que o sistema é dividido em camadas horizontais com responsabilidades distintas (apresentação, negócio, domínio, persistência), cada uma comunicando-se apenas com a camada adjacente. |
| **Domínio** (*domain*) | A área de conhecimento ou problema de negócio que o software resolve; no contexto deste projeto, os conceitos de card, coluna e etiqueta de um quadro Kanban. |
| **Modelo de domínio** (*domain model*) | Representação, em código, dos conceitos centrais do domínio por meio de classes nomeadas, em vez de estruturas de dados genéricas — termo popularizado por Eric Evans em *Domain-Driven Design*. |
| **Pool de threads** | Conjunto de threads reutilizáveis mantido por um servidor (aqui, o Tomcat embutido), cada uma capaz de processar uma requisição, permitindo atendimento paralelo de múltiplas requisições. |
| **Thread única de interface** (*Event Dispatch Thread*, Swing) | Thread exclusiva responsável por processar todos os eventos de uma interface gráfica Swing, o que serializa naturalmente qualquer acesso a dados feito em resposta a interações do usuário. |
| **Condição de corrida** (*race condition*) | Situação em que o resultado de um programa depende da ordem imprevisível de execução de operações concorrentes sobre o mesmo dado. |

### 🧪 Teste rápido

`http://localhost:8080/cards` deve continuar respondendo exatamente como antes, só que agora vindo de `Card` (classe) via `KanbanService`, não de `Map` hardcoded dentro do controller. O Angular não deve precisar de nenhuma mudança para continuar funcionando (confirme isso rodando os dois juntos de novo).

---

## Parte 11 — CRUD completo: criar, mover e excluir cards pela API

### A mentalidade desta parte

Hoje o backend só lê. Para o frontend parar de perder dados a cada F5, ele precisa poder **escrever** de volta: criar um card novo, mover um card de coluna, excluir um card — os três gestos que a Parte 7 já fazia, mas só na memória do navegador.

### Arquivos alterados no backend

`src/main/java/com/github/ahaerdy/backend/web/CardController.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/cards")
public class CardController {

    private final KanbanService service;

    public CardController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public List<Card> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Card criar(@RequestBody Card novo) {
        return service.criar(novo.getTitulo(), novo.getEtiqueta());
    }

    @PutMapping("/{id}/coluna")
    public void mover(@PathVariable String id, @RequestBody Map<String, String> body) {
        service.mover(id, body.get("coluna"));
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}
```

`src/main/java/com/github/ahaerdy/backend/service/KanbanService.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class KanbanService {

    private final List<Card> cards = new CopyOnWriteArrayList<>(List.of(
        new Card(UUID.randomUUID().toString(), "Concluir E-commerce Portfolio", "Profissional", "A_FAZER"),
        new Card(UUID.randomUUID().toString(), "Finalizar Debugging Design Patterns", "Github", "EM_ANDAMENTO")
    ));

    public List<Card> listarTodos() {
        return cards;
    }

    public Card criar(String titulo, String etiqueta) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, etiqueta, "A_FAZER");
        cards.add(novo);
        return novo;
    }

    public void mover(String id, String novaColuna) {
        cards.stream()
            .filter(c -> c.getId().equals(id))
            .findFirst()
            .ifPresent(c -> c.setColuna(novaColuna));
    }

    public void excluir(String id) {
        cards.removeIf(c -> c.getId().equals(id));
    }
}
```

### Arquivos criados e alterados no frontend

`src/app/kanban-api.service.ts` — arquivo novo:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/cards';

  listar() {
    return this.http.get<Card[]>(this.baseUrl);
  }

  criar(titulo: string, etiqueta: string) {
    return this.http.post<Card>(this.baseUrl, { titulo, etiqueta });
  }

  mover(id: string, coluna: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/coluna`, { coluna });
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

`src/app/app.ts` — substitua todo o conteúdo por (a diferença central em relação à Parte 9 é a troca de `HttpClient` direto por `KanbanApiService`, e a persistência de cada ação do usuário):

```typescript
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';
import { KanbanApiService } from './kanban-api.service';

interface CardApi extends Card {
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

const COLUNA_POR_ID: Record<string, 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'> = {
  aFazer: 'A_FAZER',
  emAndamento: 'EM_ANDAMENTO',
  concluido: 'CONCLUIDO',
};

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private api = inject(KanbanApiService);
  private cdr = inject(ChangeDetectorRef);

  aFazer: Card[] = [];
  emAndamento: Card[] = [];
  concluido: Card[] = [];

  ngOnInit() {
    this.api.listar().subscribe(cards => {
      const todas = cards as CardApi[];
      this.aFazer = todas.filter(c => c.coluna === 'A_FAZER');
      this.emAndamento = todas.filter(c => c.coluna === 'EM_ANDAMENTO');
      this.concluido = todas.filter(c => c.coluna === 'CONCLUIDO');
      this.cdr.markForCheck();
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const novaColuna = COLUNA_POR_ID[event.container.id];
    this.api.mover(card.id, novaColuna).subscribe();
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    this.api.criar(titulo, 'Geral').subscribe(novo => {
      coluna.push(novo);
      this.cdr.markForCheck();
    });
  }

  remover(coluna: Card[], card: Card) {
    this.api.excluir(card.id).subscribe(() => {
      const index = coluna.indexOf(card);
      if (index >= 0) coluna.splice(index, 1);
      this.cdr.markForCheck();
    });
  }
}
```

`src/app/app.html` não é alterado nesta etapa: os elementos `cdkDropList` já têm `id="aFazer"`, `id="emAndamento"` e `id="concluido"` desde a Parte 6, e é exatamente esse atributo que o mapa `COLUNA_POR_ID` consulta em `drop()`.

### Explicando

- `@RequestMapping("/cards")`, no nível da classe `CardController` — define um prefixo de rota comum a **todos** os métodos daquela classe. Cada anotação de método (`@GetMapping`, `@PostMapping`, etc.) passa a ser relativa a esse prefixo: `@DeleteMapping("/{id}")`, por exemplo, corresponde de fato a `DELETE /cards/{id}`, não a `DELETE /{id}`. É uma forma de evitar repetir `"/cards"` em cada um dos quatro métodos.
- `@PostMapping`, `@PutMapping("/{id}/coluna")`, `@DeleteMapping("/{id}")` — assim como `@GetMapping` (Parte 8), cada um é um atalho para `@RequestMapping` com o `method` já fixado (`POST`, `PUT`, `DELETE`, respectivamente). `{id}`, entre chaves, é uma **variável de caminho** (*path variable*): um trecho da URL tratado como parâmetro, não como texto literal — é o que `@PathVariable`, no parâmetro do método, captura.
- `@RequestBody Card novo`, no método `criar` — instrui o Spring a pegar o corpo (*body*) da requisição HTTP, que chega como texto JSON, e convertê-lo automaticamente em uma instância de `Card`. Essa conversão é feita por uma biblioteca chamada **Jackson**, incluída por padrão pelo `spring-boot-starter-webmvc`: ela usa reflexão para inspecionar os campos de `Card` e preencher cada um com o valor JSON de mesmo nome — é o motivo pelo qual `Card` precisa de um construtor sem argumentos (`public Card() {}`, já presente desde a Parte 10) e de métodos `set*` para cada campo: o Jackson os usa internamente para montar o objeto.
- `@PathVariable String id`, presente em `mover` e `excluir` — extrai o valor correspondente a `{id}`, declarado na anotação de rota do método, e o entrega como parâmetro Java comum, já convertido para `String`.
- `interface CardApi extends Card { coluna: ... }` — reaparece aqui pela mesma razão da Parte 9: a resposta da API inclui `coluna`, o modelo de domínio `Card` não.
- `COLUNA_POR_ID` — um objeto simples usado como tabela de tradução entre o `id` do elemento `cdkDropList` (`'aFazer'`, string usada no HTML) e o valor de coluna esperado pela API (`'A_FAZER'`, string usada pelo backend). `event.container.id`, fornecido pelo CDK, informa em qual `cdkDropList` o card foi solto.
- No método `drop`, a persistência (`this.api.mover(...)`) só acontece no caso de **transferência entre colunas** — uma reordenação dentro da mesma coluna não altera o campo `coluna` do card, então não há nada nesse campo para sincronizar com o servidor nesta etapa (a posição relativa dentro da coluna não é persistida; isso é uma decisão de escopo, retomada no encerramento do tutorial).
- Em `adicionar`, a criação **espera a resposta do servidor** (`subscribe(novo => ...)`) antes de exibir o card na tela, em vez de gerar um `id` no navegador e assumir otimisticamente que o servidor vai aceitar. Isso garante que o `id` usado pelo `track c.id` do template seja sempre o `id` real, gerado pelo backend.
- Em `remover`, a exclusão também espera a confirmação do servidor antes de remover o card da tela, evitando que um card "pisque" de volta caso a exclusão falhe.
- Já em `drop`, a atualização visual é **imediata** (a chamada `moveItemInArray`/`transferArrayItem` já reordena o array local, e só depois `this.api.mover(...)` é disparada). Essa diferença é proposital: esperar a resposta do servidor antes de mover o card visualmente tornaria o arrastar-e-soltar visivelmente lento. Se a chamada ao backend falhar, a tela ficaria temporariamente fora de sincronia com o banco — uma limitação conhecida, não tratada nesta etapa (nenhum mecanismo de repetição ou reversão foi implementado).
- `this.cdr.markForCheck()`, presente em `ngOnInit`, `adicionar` e `remover` — necessário pelo mesmo motivo explicado na Parte 9: essas três atualizações de estado acontecem dentro de um callback de `.subscribe()`, executado de forma assíncrona, fora do alcance da detecção automática de mudanças desta versão do Angular (zoneless por padrão). Já `drop` **não precisa** dessa chamada: a mutação do array (`moveItemInArray`/`transferArrayItem`) acontece de forma síncrona, diretamente dentro do método chamado pelo evento de template `(cdkDropListDropped)`, uma das situações que já dispara a verificação automaticamente.

### Glossário — Parte 11

| Termo | Significado |
|---|---|
| **`@RequestMapping`** | Anotação Spring que define um prefixo de rota, aplicável a nível de classe ou de método; as anotações de verbo (`@GetMapping`, `@PostMapping`, etc.) são atalhos que a combinam com um método HTTP fixo. |
| **Variável de caminho** (*path variable*) | Trecho de uma URL, delimitado por chaves na anotação de rota (`{id}`), tratado como parâmetro em vez de texto literal. |
| **Jackson** | Biblioteca de serialização/desserialização JSON usada internamente pelo Spring, responsável por converter objetos Java em JSON e vice-versa. |
| **`@RequestBody`** | Anotação Spring que desserializa o corpo de uma requisição HTTP em um objeto Java, usando o Jackson internamente. |
| **`@PathVariable`** | Anotação Spring que extrai o valor de uma variável de caminho e o entrega como parâmetro do método. |
| **`@Injectable({ providedIn: 'root' })`** | Registra um serviço Angular como singleton global, injetável em qualquer componente. |
| **CRUD** | Sigla para *Create, Read, Update, Delete*: as quatro operações básicas sobre um dado persistido. |
| **Atualização otimista** | Padrão de interface em que a mudança é refletida na tela antes da confirmação do servidor, para manter a interação responsiva, assumindo que a operação normalmente terá sucesso. |
| **`ChangeDetectorRef.markForCheck()`** | Método que notifica manualmente o Angular de que um componente precisa ser reavaliado, necessário para atualizações de estado originadas de callbacks assíncronos nesta versão zoneless do Angular. |

### 🧪 Teste rápido

Crie um card novo pelo frontend; confirme que `GET /cards` (direto no navegador ou via `curl`) já mostra o novo card, com o mesmo `id` exibido na tela. Arraste um card entre colunas e recarregue a página inteira (F5); ele deve continuar na coluna para onde foi movido. Remova um card e confirme que ele some tanto do frontend quanto de `GET /cards`.

---

## Parte 12 — A dor do restart: nasce a persistência de verdade (com MySQL via Docker)

### A mentalidade desta parte

A Parte 11 resolveu o F5 do **navegador**, mas reinicie o processo Java (pare e rode `BackendApplication` de novo) e tudo volta aos dois cards de exemplo. Isso porque `cards` ainda vive só na memória do processo, dentro de uma lista comum.

Diferente do caminho mais comum em tutoriais (começar com um banco embutido como o H2, e só depois trocar por um banco "de verdade"), aqui já vamos direto para **MySQL rodando em um container Docker**, porque este projeto tem MySQL como destino final definido desde o início.

### Por que um container, e não instalar o MySQL direto na máquina?

Instalar o MySQL diretamente no sistema operacional funciona, mas amarra o banco à sua máquina específica: versão instalada, serviço rodando em segundo plano, configuração de usuário/senha feita manualmente uma vez e depois esquecida. Um **container Docker** resolve isso de um jeito mais alinhado ao restante do projeto: a definição do banco (versão, usuário, senha, porta) vira **um arquivo versionado no repositório** (`docker-compose.yml`), e qualquer pessoa sobe o mesmo banco com um único comando.

### Instalando o Docker

1. Baixe o **Docker Desktop** em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) (Windows, Mac ou Linux) e instale.
2. Abra o Docker Desktop uma vez (ele precisa ficar rodando em segundo plano para os comandos `docker`/`docker compose` funcionarem).
3. Confirme no terminal:
   ```bash
   docker --version
   docker compose version
   ```

### Arquivos criados no backend

`docker-compose.yml`, na raiz da pasta `backend/` (mesmo nível de `pom.xml`) — arquivo novo:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: kanban-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: kanban
      MYSQL_USER: kanban
      MYSQL_PASSWORD: kanban
      MYSQL_ROOT_PASSWORD: kanban_root
    ports:
      - "3306:3306"
    volumes:
      - kanban_mysql_data:/var/lib/mysql

volumes:
  kanban_mysql_data:
```

Suba o container:

```bash
docker compose up -d
docker ps
```

`docker ps` deve listar um container chamado `kanban-mysql`, com status `Up`.

`src/main/resources/application.properties` — arquivo novo (ou, se já existir vazio, substitua todo o conteúdo por):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kanban
spring.datasource.username=kanban
spring.datasource.password=kanban
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

`src/main/java/com/github/ahaerdy/backend/repository/CardRepository.java` — arquivo novo:

```java
package com.github.ahaerdy.backend.repository;

import com.github.ahaerdy.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, String> {
}
```

### Arquivo alterado: `pom.xml`

Abra `pom.xml`, na raiz do projeto `backend`, localize a tag `<dependencies>` já existente (com a dependência `spring-boot-starter-webmvc`, adicionada na Parte 8) e acrescente estas duas dependências dentro dela, sem remover a que já está lá:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Arquivos alterados

`src/main/java/com/github/ahaerdy/backend/model/Card.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;
    private String etiqueta;
    private String coluna;

    public Card() {
    }

    public Card(String id, String titulo, String etiqueta, String coluna) {
        this.id = id;
        this.titulo = titulo;
        this.etiqueta = etiqueta;
        this.coluna = coluna;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getColuna() {
        return coluna;
    }

    public void setColuna(String coluna) {
        this.coluna = coluna;
    }
}
```

`src/main/java/com/github/ahaerdy/backend/service/KanbanService.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KanbanService {

    private final CardRepository repository;

    public KanbanService(CardRepository repository) {
        this.repository = repository;
    }

    public List<Card> listarTodos() {
        return repository.findAll();
    }

    public Card criar(String titulo, String etiqueta) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, etiqueta, "A_FAZER");
        return repository.save(novo);
    }

    public void mover(String id, String novaColuna) {
        repository.findById(id).ifPresent(c -> {
            c.setColuna(novaColuna);
            repository.save(c);
        });
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}
```

`CardController.java` não é alterado nesta etapa: sua interface pública (os quatro endpoints) permanece idêntica à da Parte 11; apenas a implementação de `KanbanService`, por trás dele, mudou de estratégia de armazenamento.

### Comandos do dia a dia com o Docker Compose

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Sobe o container (cria, se ainda não existir) |
| `docker compose stop` | Para o container, **preservando** os dados no volume |
| `docker compose down` | Remove o container (o volume `kanban_mysql_data` sobrevive, a menos que você use `down -v`) |
| `docker compose down -v` | Remove o container **e** o volume, apagando os dados de vez; use com cuidado |
| `docker compose logs -f mysql` | Acompanha os logs do MySQL em tempo real |

### Explicando

- `docker-compose.yml` — descreve, declarativamente, quais containers o projeto precisa. É um arquivo de texto versionado no Git.
- `image: mysql:8.0` — a versão exata da imagem oficial do MySQL a usar. Fixar a versão evita que o comportamento do banco mude sem aviso no futuro.
- `environment` — variáveis de ambiente que a imagem do MySQL usa, na primeira vez que o container sobe, para criar o banco (`MYSQL_DATABASE: kanban`) e um usuário de aplicação já com permissão sobre ele.
- `ports: "3306:3306"` — mapeia a porta `3306` dentro do container para a porta `3306` da máquina host, permitindo que o backend se conecte via `localhost:3306`.
- `volumes` — sem isso, os dados do MySQL morreriam junto com o container a cada `docker compose down`. É o volume, não o container, que garante a persistência real.
- `mysql-connector-j` — o driver JDBC do MySQL: a biblioteca Java que sabe efetivamente falar o protocolo de rede do MySQL.
- `spring.datasource.url=jdbc:mysql://localhost:3306/kanban` — a URL JDBC, informando driver, endereço, porta e nome do banco a usar.
- `@Entity` / `@Id` — marcam `Card` como uma entidade persistida: o Spring Data JPA (mais precisamente, o **Hibernate**, a implementação de JPA usada por baixo do Spring Data) passa a mapear cada instância dessa classe para uma linha de uma tabela no banco (por convenção, uma tabela chamada `card`, com uma coluna por campo), usando `id` como chave primária. Esse mapeamento também é resolvido por reflexão, na inicialização da aplicação: o Hibernate inspeciona a classe `Card`, lê suas anotações e seus campos, e gera (ou valida, dependendo da configuração) o esquema de tabela correspondente — é o mesmo mecanismo geral de "anotação lida por reflexão" já visto nas anotações do Spring Web, aplicado agora à camada de persistência.
- `JpaRepository<Card, String>` — ao estender essa interface, sem escrever nenhuma implementação, `CardRepository` já ganha `findAll()`, `save()`, `findById()`, `deleteById()` prontos.
- `KanbanService` trocou de dependência (`List` em memória → `CardRepository`), mas sua API pública (`listarTodos`, `criar`, `mover`, `excluir`) não mudou. Isso é o valor concreto de ter extraído `KanbanService` na Parte 10: a troca de estratégia de armazenamento ficou isolada em um único lugar, sem exigir alterações no controller nem no frontend.

### Glossário — Parte 12

| Termo | Significado |
|---|---|
| **Docker** | Plataforma para empacotar e rodar aplicações em containers isolados, sem instalá-las diretamente no sistema operacional. |
| **Container** | Uma instância em execução de uma imagem; aqui, um processo MySQL isolado, criado a partir da imagem `mysql:8.0`. |
| **Imagem (Docker)** | O "molde" a partir do qual containers são criados. |
| **Docker Compose** | Ferramenta que descreve, em um arquivo YAML, um ou mais containers relacionados e sobe todos juntos com um único comando. |
| **Volume (Docker)** | Área de armazenamento gerenciada pelo Docker que sobrevive à remoção do container. |
| **JPA** (*Jakarta Persistence API*) | Especificação Java para mapear objetos para tabelas de banco de dados relacional (ORM). |
| **Hibernate** | Implementação de JPA usada por baixo do Spring Data JPA, responsável por gerar o SQL real e mapear objetos Java para linhas de tabela, via reflexão sobre as anotações da entidade. |
| **`@Entity`** | Anotação JPA que marca uma classe Java como mapeada para uma tabela de banco de dados. |
| **`@Id`** | Anotação JPA que marca um campo como a chave primária da tabela correspondente à entidade. |
| **`JpaRepository<T, ID>`** | Interface do Spring Data que fornece operações CRUD prontas para uma entidade, sem exigir implementação manual. |
| **Driver JDBC** | Biblioteca que implementa a comunicação de rede específica de um banco de dados. |
| **URL JDBC** | String de conexão que informa driver, endereço, porta e nome do banco a ser usado. |

### 🧪 Teste rápido

Com `docker compose up -d` rodando, suba o backend, crie alguns cards e mova-os entre colunas. Pare completamente o processo Java (não o container) e rode de novo; os dados devem continuar lá, agora vindos do MySQL. Rode `docker compose stop && docker compose up -d` para confirmar que os dados sobrevivem até a um restart do próprio banco. Só um `docker compose down -v` deve apagar tudo; teste isso por último, sabendo que é destrutivo.

---

## Parte 13 — `coluna` como `enum`, não como `String` livre

### A mentalidade desta parte

`coluna` sempre foi uma `String`, digitada em vários pontos do backend e do frontend. Nada, hoje, impede que alguém envie `"A_FASER"` num corpo de requisição e o Spring aceite, criando um card "órfão" que nenhuma coluna do frontend exibe. É o gatilho `#4` do catálogo: um conceito com um número fechado de estados possíveis, hoje representado por um tipo aberto demais.

### Arquivos criados no backend

`src/main/java/com/github/ahaerdy/backend/model/ColunaEnum.java` — arquivo novo:

```java
package com.github.ahaerdy.backend.model;

public enum ColunaEnum {
    A_FAZER, EM_ANDAMENTO, CONCLUIDO
}
```

`src/main/java/com/github/ahaerdy/backend/web/ColunaRequest.java` — arquivo novo. Ele substitui o `Map<String, String>` usado até aqui como corpo da requisição de mover um card, tornando explícito qual campo é esperado e de que tipo:

```java
package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.ColunaEnum;

public record ColunaRequest(ColunaEnum coluna) {
}
```

### Arquivos alterados

`src/main/java/com/github/ahaerdy/backend/model/Card.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;
    private String etiqueta;

    @Enumerated(EnumType.STRING)
    private ColunaEnum coluna;

    public Card() {
    }

    public Card(String id, String titulo, String etiqueta, ColunaEnum coluna) {
        this.id = id;
        this.titulo = titulo;
        this.etiqueta = etiqueta;
        this.coluna = coluna;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public ColunaEnum getColuna() {
        return coluna;
    }

    public void setColuna(ColunaEnum coluna) {
        this.coluna = coluna;
    }
}
```

`src/main/java/com/github/ahaerdy/backend/web/CardController.java` — substitua todo o conteúdo por (a única mudança é o tipo do parâmetro `body` do método `mover`, de `Map<String, String>` para `ColunaRequest`):

```java
package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/cards")
public class CardController {

    private final KanbanService service;

    public CardController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public List<Card> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Card criar(@RequestBody Card novo) {
        return service.criar(novo.getTitulo(), novo.getEtiqueta());
    }

    @PutMapping("/{id}/coluna")
    public void mover(@PathVariable String id, @RequestBody ColunaRequest body) {
        service.mover(id, body.coluna());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}
```

`src/main/java/com/github/ahaerdy/backend/service/KanbanService.java` — substitua todo o conteúdo por:

```java
package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.model.ColunaEnum;
import com.github.ahaerdy.backend.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KanbanService {

    private final CardRepository repository;

    public KanbanService(CardRepository repository) {
        this.repository = repository;
    }

    public List<Card> listarTodos() {
        return repository.findAll();
    }

    public Card criar(String titulo, String etiqueta) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, etiqueta, ColunaEnum.A_FAZER);
        return repository.save(novo);
    }

    public void mover(String id, ColunaEnum novaColuna) {
        repository.findById(id).ifPresent(c -> {
            c.setColuna(novaColuna);
            repository.save(c);
        });
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}
```

O frontend não precisa de nenhuma alteração nesta etapa: `KanbanApiService.mover` já envia `{ coluna }` como um valor de texto (por exemplo, `"EM_ANDAMENTO"`), e o Spring converte automaticamente esse texto para a constante correspondente de `ColunaEnum` ao desserializar `ColunaRequest`.

### Explicando

- `@Enumerated(EnumType.STRING)` — diz ao JPA para persistir o `enum` como o nome do valor (`"A_FAZER"`) na coluna do banco. Sem essa anotação, o comportamento padrão do JPA seria `EnumType.ORDINAL`, que grava apenas a **posição numérica** da constante dentro do `enum` (`0` para o primeiro valor declarado, `1` para o segundo, e assim por diante) — mais compacto no banco, mas perigoso: se um valor novo for inserido no meio da declaração do `enum` no futuro, ou a ordem dos valores existentes mudar, os números já salvos passam a apontar para constantes diferentes das que representavam originalmente, corrompendo silenciosamente dados antigos, sem nenhum erro visível. `EnumType.STRING` é mais verboso no banco, mas imune a esse problema.
- `record ColunaRequest(ColunaEnum coluna)` — um **record** Java (recurso disponível desde o Java 16), uma forma concisa de declarar uma classe imutável focada em carregar dados, sem a necessidade de escrever construtor, getters, `equals`, `hashCode` e `toString` manualmente. `body.coluna()` acessa o valor (records geram métodos de acesso sem o prefixo `get`).
- Agora, se o corpo de uma requisição trouxer uma coluna que não existe (`"A_FASER"`), o Spring rejeita automaticamente a requisição com erro `400 Bad Request`, já que o Jackson (biblioteca de serialização JSON usada pelo Spring) não consegue converter esse texto para nenhuma constante de `ColunaEnum`.

### Glossário — Parte 13

| Termo | Significado |
|---|---|
| **`enum`** (Java) | Tipo que representa um conjunto fixo e nomeado de constantes; aqui, os três estados possíveis de uma coluna. |
| **`@Enumerated(EnumType.STRING)`** | Configura o JPA para persistir um `enum` pelo seu nome textual, em vez do índice numérico padrão. |
| **`record`** (Java) | Tipo de classe concisa, introduzido no Java 16, voltada para carregar dados imutáveis, com construtor e métodos de acesso gerados automaticamente. |
| **`400 Bad Request`** | Código de status HTTP que indica que a requisição enviada pelo cliente é malformada ou inválida. |

### 🧪 Teste rápido

Envie manualmente uma requisição `PUT /cards/{id}/coluna` com o corpo `{"coluna": "NAO_EXISTE"}` (via `curl` ou uma ferramenta como Postman/Insomnia); o backend deve recusar com `400`, em vez de aceitar silenciosamente. O comportamento normal do frontend (mover entre as três colunas válidas) deve continuar idêntico.

---

## Parte 14 — Etiquetas coloridas de verdade

### A mentalidade desta parte

Desde a Parte 2, cada etiqueta nova (`tag-profissional`, `tag-estudos`, `tag-github`) exigiu uma classe CSS escrita à mão. O print do Gemini mostra mais etiquetas do que as que criamos (`Prioridade Alta`, `Concluído`); se continuarmos assim, o arquivo `card-item.scss` cresce uma regra por etiqueta nova, para sempre. Hora de tratar "etiqueta" como dado, e de permitir mais de uma etiqueta por card.

### Arquivos criados no backend

`src/main/java/com/github/ahaerdy/backend/model/EtiquetaEnum.java` — arquivo novo:

```java
package com.github.ahaerdy.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EtiquetaEnum {
    PROFISSIONAL("#7e57c2"),
    ESTUDOS("#43a047"),
    GITHUB("#29b6f6"),
    PRIORIDADE_ALTA("#e53935"),
    GEMINI("#fb8c00");

    private final String corHex;

    EtiquetaEnum(String corHex) {
        this.corHex = corHex;
    }

    public String getCorHex() {
        return corHex;
    }
}
```

### Arquivos alterados no backend

`src/main/java/com/github/ahaerdy/backend/model/Card.java` — substitua todo o conteúdo por (o campo `etiqueta`, no singular, é removido; entra `etiquetas`, uma coleção):

```java
package com.github.ahaerdy.backend.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Card {

    @Id
    private String id;
    private String titulo;

    @Enumerated(EnumType.STRING)
    private ColunaEnum coluna;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<EtiquetaEnum> etiquetas = new ArrayList<>();

    public Card() {
    }

    public Card(String id, String titulo, ColunaEnum coluna) {
        this.id = id;
        this.titulo = titulo;
        this.coluna = coluna;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public ColunaEnum getColuna() {
        return coluna;
    }

    public void setColuna(ColunaEnum coluna) {
        this.coluna = coluna;
    }

    public List<EtiquetaEnum> getEtiquetas() {
        return etiquetas;
    }

    public void setEtiquetas(List<EtiquetaEnum> etiquetas) {
        this.etiquetas = etiquetas;
    }
}
```

`src/main/java/com/github/ahaerdy/backend/service/KanbanService.java` — substitua todo o conteúdo por (o método `criar` deixa de receber uma etiqueta; cada card nasce sem etiquetas atribuídas):

```java
package com.github.ahaerdy.backend.service;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.model.ColunaEnum;
import com.github.ahaerdy.backend.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KanbanService {

    private final CardRepository repository;

    public KanbanService(CardRepository repository) {
        this.repository = repository;
    }

    public List<Card> listarTodos() {
        return repository.findAll();
    }

    public Card criar(String titulo) {
        var novo = new Card(UUID.randomUUID().toString(), titulo, ColunaEnum.A_FAZER);
        return repository.save(novo);
    }

    public void mover(String id, ColunaEnum novaColuna) {
        repository.findById(id).ifPresent(c -> {
            c.setColuna(novaColuna);
            repository.save(c);
        });
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}
```

`src/main/java/com/github/ahaerdy/backend/web/CardController.java` — substitua todo o conteúdo por (a única mudança é a chamada dentro de `criar`, que deixa de passar `novo.getEtiqueta()`):

```java
package com.github.ahaerdy.backend.web;

import com.github.ahaerdy.backend.model.Card;
import com.github.ahaerdy.backend.service.KanbanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/cards")
public class CardController {

    private final KanbanService service;

    public CardController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public List<Card> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Card criar(@RequestBody Card novo) {
        return service.criar(novo.getTitulo());
    }

    @PutMapping("/{id}/coluna")
    public void mover(@PathVariable String id, @RequestBody ColunaRequest body) {
        service.mover(id, body.coluna());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}
```

### Arquivos alterados no frontend

`src/app/models/card.ts` — substitua todo o conteúdo por:

```typescript
export interface Etiqueta {
  name: string;
  corHex: string;
}

export interface Card {
  id: string;
  titulo: string;
  etiquetas: Etiqueta[];
}
```

`src/app/card-item/card-item.ts` — substitua todo o conteúdo por:

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
  @Output() remover = new EventEmitter<Card>();

  formatarNome(nome: string): string {
    return nome
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letra => letra.toUpperCase());
  }
}
```

`src/app/card-item/card-item.html` — substitua todo o conteúdo por:

```html
<div class="card">
  @for (e of card.etiquetas; track e.name) {
    <span class="tag" [style.background]="e.corHex">{{ formatarNome(e.name) }}</span>
  }
  <strong>{{ card.titulo }}</strong>
  <button class="remover" (click)="remover.emit(card)">×</button>
</div>
```

`src/app/card-item/card-item.scss` — substitua todo o conteúdo por (a cor fixa do `.tag` é removida, já que agora vem por `[style.background]`; foi adicionado espaçamento entre etiquetas, para o caso de mais de uma no mesmo card):

```scss
.card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.15); position: relative; }
.tag { display: inline-block; font-size: 0.7rem; color: white; border-radius: 4px; padding: 2px 6px; margin-bottom: 4px; margin-right: 4px; }
.remover { position: absolute; top: 0.5rem; right: 0.5rem; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #999; }
```

`src/app/kanban-api.service.ts` — substitua todo o conteúdo por (o método `criar` deixa de receber uma etiqueta):

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/cards';

  listar() {
    return this.http.get<Card[]>(this.baseUrl);
  }

  criar(titulo: string) {
    return this.http.post<Card>(this.baseUrl, { titulo });
  }

  mover(id: string, coluna: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/coluna`, { coluna });
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

`src/app/app.ts` — substitua todo o conteúdo por (a única mudança em relação à Parte 11 é a chamada dentro de `adicionar`, que deixa de passar `'Geral'`):

```typescript
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card';
import { CardItemComponent } from './card-item/card-item';
import { KanbanApiService } from './kanban-api.service';

interface CardApi extends Card {
  coluna: 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

const COLUNA_POR_ID: Record<string, 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO'> = {
  aFazer: 'A_FAZER',
  emAndamento: 'EM_ANDAMENTO',
  concluido: 'CONCLUIDO',
};

@Component({
  imports: [CardItemComponent, DragDropModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private api = inject(KanbanApiService);
  private cdr = inject(ChangeDetectorRef);

  aFazer: Card[] = [];
  emAndamento: Card[] = [];
  concluido: Card[] = [];

  ngOnInit() {
    this.api.listar().subscribe(cards => {
      const todas = cards as CardApi[];
      this.aFazer = todas.filter(c => c.coluna === 'A_FAZER');
      this.emAndamento = todas.filter(c => c.coluna === 'EM_ANDAMENTO');
      this.concluido = todas.filter(c => c.coluna === 'CONCLUIDO');
      this.cdr.markForCheck();
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const novaColuna = COLUNA_POR_ID[event.container.id];
    this.api.mover(card.id, novaColuna).subscribe();
  }

  adicionar(coluna: Card[], titulo: string) {
    if (!titulo.trim()) return;
    this.api.criar(titulo).subscribe(novo => {
      coluna.push(novo);
      this.cdr.markForCheck();
    });
  }

  remover(coluna: Card[], card: Card) {
    this.api.excluir(card.id).subscribe(() => {
      const index = coluna.indexOf(card);
      if (index >= 0) coluna.splice(index, 1);
      this.cdr.markForCheck();
    });
  }
}
```

### Explicando

- `@ElementCollection` — anotação JPA para persistir uma coleção de valores simples (aqui, `enum`s) associada a uma entidade, sem precisar criar uma tabela/entidade separada para "etiqueta". Uma entidade `Etiqueta` completa, com sua própria tabela e `id`, só se justificaria se etiquetas precisassem ser criadas ou editadas dinamicamente pelo usuário, o que não é um requisito deste projeto por ora.
- `@JsonFormat(shape = JsonFormat.Shape.OBJECT)`, em `EtiquetaEnum` — por padrão, o Jackson (biblioteca de serialização JSON usada pelo Spring) converte um `enum` para JSON usando apenas o seu nome, como uma string simples (por exemplo, `"PROFISSIONAL"`), ignorando qualquer campo adicional como `corHex`. Essa anotação instrui o Jackson a serializar cada constante como um objeto completo, incluindo seus métodos de acesso (`getCorHex()`), o que produz, para cada etiqueta, um JSON no formato `{"name":"PROFISSIONAL","corHex":"#7e57c2"}`.
- `formatarNome(nome: string)`, no frontend — o campo `name`, vindo do backend, é o nome bruto da constante Java (`"PRIORIDADE_ALTA"`). Essa função o converte para uma forma de leitura mais natural (`"Prioridade Alta"`), sem exigir nenhuma tradução mantida manualmente no backend.
- A criação de um card, desde a Parte 7, atribuía a etiqueta fixa `"Geral"` ao card recém-criado. Com a mudança para uma coleção de etiquetas, essa atribuição automática foi removida: um card criado pelo botão "+" nasce **sem nenhuma etiqueta**. Não foi construída, nesta etapa, nenhuma interface para o usuário escolher etiquetas ao criar um card; isso é uma decisão consciente de escopo, e não uma lacuna esquecida: nenhuma parte do sistema, até aqui, precisa dessa funcionalidade para ser útil. Uma etiqueta pode, por enquanto, ser associada a um card através de uma chamada direta à API (por exemplo, `PUT /cards/{id}` com o corpo apropriado, endpoint que pode ser adicionado quando essa necessidade se tornar real).

### Glossário — Parte 14

| Termo | Significado |
|---|---|
| **`@ElementCollection`** | Anotação JPA para mapear uma coleção de valores simples (não entidades completas) associada a uma entidade dona. |
| **`@JsonFormat(shape = JsonFormat.Shape.OBJECT)`** | Anotação do Jackson que faz um `enum` ser serializado como um objeto JSON completo (incluindo seus métodos de acesso), em vez de apenas o nome da constante. |
| **`[style.background]`** | Vínculo de propriedade do Angular que define diretamente uma propriedade CSS a partir de uma expressão. |
| **Enum com atributo** (Java) | Um `enum` pode ter campos e construtor próprios, permitindo associar dados fixos (aqui, uma cor) a cada constante. |

### 🧪 Teste rápido

Crie um card pelo frontend; ele deve aparecer sem nenhuma etiqueta. Usando `curl` ou uma ferramenta como Postman/Insomnia, associe uma etiqueta a um card existente através de uma chamada direta ao banco ou de um pequeno script (o endpoint de edição de etiquetas não foi construído nesta etapa; se quiser testar visualmente antes de construí-lo, você pode inserir um valor diretamente na tabela do MySQL). Recarregue o frontend e confirme que a etiqueta aparece com a cor correspondente à constante em `EtiquetaEnum`, e com o texto formatado (por exemplo, `PRIORIDADE_ALTA` exibido como "Prioridade Alta").

---

## Parte 15 — Sincronizando o estado no frontend: um `KanbanStateService`

### A mentalidade desta parte

Hoje, `App` guarda `aFazer`, `emAndamento`, `concluido` e é o único que sabe atualizá-los depois de uma chamada à API. Funciona enquanto só existir um componente cuidando do board inteiro. Mas assim que você quiser, por exemplo, um contador de tarefas pendentes em algum outro canto da tela, esse componente novo não teria como saber quando `App` move ou cria um card. Exatamente o gatilho `#5` do catálogo: um dado muda, e algo que depende dele não é avisado.

### Arquivo criado

`src/app/kanban-state.service.ts` — arquivo novo:

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KanbanApiService } from './kanban-api.service';
import { Card } from './models/card';

@Injectable({ providedIn: 'root' })
export class KanbanStateService {
  private api = inject(KanbanApiService);
  private cardsSubject = new BehaviorSubject<Card[]>([]);
  readonly cards$ = this.cardsSubject.asObservable();

  carregar() {
    this.api.listar().subscribe(cards => this.cardsSubject.next(cards));
  }

  mover(id: string, coluna: string) {
    this.api.mover(id, coluna).subscribe(() => this.carregar());
  }

  criar(titulo: string) {
    this.api.criar(titulo).subscribe(() => this.carregar());
  }

  excluir(id: string) {
    this.api.excluir(id).subscribe(() => this.carregar());
  }
}
```

### Um exemplo completo de uso: contador de cards

Para demonstrar de forma concreta como um segundo componente se beneficia do `KanbanStateService`, sem depender de `App`, criamos um pequeno componente adicional, ilustrativo.

`src/app/card-count/card-count.ts` — arquivo novo:

```typescript
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { KanbanStateService } from '../kanban-state.service';

@Component({
  imports: [AsyncPipe],
  selector: 'app-card-count',
  templateUrl: './card-count.html',
})
export class CardCountComponent {
  private state = inject(KanbanStateService);
  cards$ = this.state.cards$;
}
```

`src/app/card-count/card-count.html` — arquivo novo:

```html
<p>{{ (cards$ | async)?.length ?? 0 }} cards no total</p>
```

Para exibi-lo, adicione a linha `<app-card-count />` em algum ponto de `src/app/app.html` (por exemplo, logo abaixo do `<h1>Kanban</h1>`), e inclua `CardCountComponent` no array `imports` de `src/app/app.ts`.

### Explicando

- `BehaviorSubject<Card[]>` — um tipo especial de `Observable` do RxJS que guarda o valor atual e o entrega imediatamente a qualquer novo inscrito, além de notificar todos os inscritos existentes a cada `.next(...)`. É, na prática, o mesmo papel do `NotifierService` do Sudoku (Parte 10): um ponto central que avisa todo mundo interessado quando o estado muda.
- `.asObservable()` — expõe `cards$` como somente leitura para quem consome o serviço; só o próprio `KanbanStateService` pode chamar `.next(...)`.
- `AsyncPipe` (`| async`) — *pipe* do Angular que se inscreve automaticamente em um `Observable` dentro do template e libera a inscrição quando o componente é destruído. Precisa ser adicionado ao array `imports` do componente que o usa, assim como qualquer outra dependência de template nesta versão do Angular. Diferente do padrão `.subscribe()` manual usado em `App` desde a Parte 9, o `AsyncPipe` chama `markForCheck()` internamente a cada emissão — por isso `CardCountComponent` não precisa de nenhuma injeção de `ChangeDetectorRef` para funcionar corretamente nesta versão zoneless do Angular.
- `CardCountComponent` não depende de `App` para saber quantos cards existem: ele injeta `KanbanStateService` diretamente e se inscreve em `cards$` por conta própria. Sempre que `App` (ou qualquer outro componente) chamar `carregar()`, `mover()`, `criar()` ou `excluir()` através do serviço, `CardCountComponent` é notificado automaticamente, sem nenhuma comunicação direta entre os dois componentes.

### Uma fronteira explícita do que foi implementado

`App`, hoje, ainda gerencia seus três arrays (`aFazer`, `emAndamento`, `concluido`) diretamente, chamando `KanbanApiService` por conta própria, como ficou desde a Parte 11. Migrar `App` para consumir `KanbanStateService` no lugar de `KanbanApiService` diretamente é possível, mas exigiria reconciliar o estado assíncrono do serviço (`cards$`, uma lista única) com os três arrays concretos que o `cdkDropListData` do Angular CDK exige. Uma forma de fazer isso seria `App` se inscrever em `cards$` dentro de `ngOnInit`, dividindo o resultado nos três arrays a cada emissão, de forma equivalente ao que a chamada a `api.listar()` já faz hoje (incluindo a mesma chamada a `this.cdr.markForCheck()`, pelo mesmo motivo explicado na Parte 9). Essa migração não foi realizada neste tutorial: nenhum segundo consumidor do estado do board, além do próprio `App`, existe de fato no projeto (`CardCountComponent`, acima, é apenas ilustrativo), então a duplicação de lógica de sincronização entre `App` e `KanbanStateService` ainda não gera nenhum problema real a resolver.

### Glossário — Parte 15

| Termo | Significado |
|---|---|
| **`BehaviorSubject`** (RxJS) | Observable que mantém o último valor emitido e o entrega a cada novo inscrito imediatamente, além de notificar mudanças futuras. |
| **`.next(valor)`** | Método que emite um novo valor para todos os inscritos de um `Subject`/`BehaviorSubject`. |
| **`.asObservable()`** | Expõe um `Subject` como um `Observable` somente leitura, escondendo o método `.next()` de quem consome. |
| **`AsyncPipe` (`\| async`)** | *Pipe* do Angular que se inscreve automaticamente em um `Observable` dentro do template e libera a inscrição quando o componente é destruído. |
| **Padrão Observer** | Padrão de projeto onde um sujeito notifica automaticamente todos os interessados quando seu estado muda; aqui, implementado via RxJS em vez de uma interface `EventListener` escrita à mão (como no Sudoku). |

### 🧪 Teste rápido

Com `CardCountComponent` adicionado a `app.html` (conforme descrito acima), o número exibido deve corresponder à quantidade total de cards. Chame `this.state.carregar()` manualmente (por exemplo, temporariamente, a partir do console do navegador, se `KanbanStateService` estiver acessível, ou adicionando uma chamada em outro ponto do código) e confirme que o contador se atualiza sem que `App` tenha feito nada além de existir.

---

## Encerrando o projeto: por que paramos aqui

Com a Parte 15, o projeto está funcionalmente completo dentro do escopo definido na abertura deste documento: um Kanban de coluna fixa, com cards, etiquetas coloridas, arrastar-e-soltar, persistência real em banco, e frontend e backend cada um com seu domínio isolado. Como no Sudoku, vale registrar, com o mesmo rigor aplicado a cada extração, por que paramos exatamente aqui, porque decidir não continuar também é um exercício do método.

### Tentações que ficaram de fora, e por quê

1. **Múltiplos boards** (o print do Gemini mostra "Boards" no menu lateral, no plural). O domínio inteiro, backend e frontend, foi construído assumindo um único board implícito. Adicionar múltiplos boards exigiria uma nova entidade `Board` no backend (cada `Card` passaria a pertencer a um `Board`, não só a uma coluna) e uma tela de listagem/seleção no frontend. Isso é o gatilho `#7` em potencial (um `Card` ganharia mais um parâmetro relacional), mas nenhum consumidor real pediu por múltiplos boards ainda; seria construir a abstração antes da necessidade real, exatamente o que o gatilho `#8`/YAGNI pede para evitar.
2. **Autenticação e múltiplos usuários.** Hoje qualquer pessoa que acesse `localhost:8080` vê e edita os mesmos cards; não há conceito de dono do card ou de sessão. Adicionar isso exigiria Spring Security, um modelo de usuário e provavelmente JWT: uma camada inteira nova, não uma refatoração incremental. Ficou de fora por decisão de escopo: este projeto, como o Sudoku, é uma prova de conceito de uma pessoa só.
3. **Sincronização em tempo real entre abas ou dispositivos** (WebSocket). O `KanbanStateService` da Parte 15 resolve a sincronização dentro de uma única aba do navegador, mas se o Kanban for aberto em duas abas e um card for movido em uma delas, a outra só refletiria a mudança em uma próxima chamada a `carregar()`. Resolver isso de fato pediria um canal push do backend para o frontend (STOMP sobre WebSocket, por exemplo). Ficou de fora porque nenhuma necessidade real apareceu: um usuário só, em uma aba só, não sente essa falta.
4. **Otimizar `KanbanStateService` para não recarregar a lista inteira a cada ação.** Hoje, `mover`/`criar`/`excluir` sempre buscam tudo de novo do backend. Com um board pequeno, isso é imperceptível. Otimizar agora, sem um sintoma real de lentidão, violaria de propósito a Regra 4 do Design Simples (mais elementos no código sem que nenhuma das três primeiras regras exigisse isso).
5. **Persistência da posição relativa de um card dentro da mesma coluna.** Observado na Parte 11: reordenar cards dentro da mesma coluna, por arrastar e soltar, não é persistido no backend, apenas a mudança entre colunas. Resolver isso exigiria um campo de posição ordinal em `Card` e ajustes correspondentes em todo reordenamento. Ficou de fora pela mesma razão: nenhuma necessidade concreta chegou a apontar para isso.

Nenhuma dessas decisões é definitiva. Como no Sudoku, se uma necessidade real aparecer, o catálogo de gatilhos continua disponível para orientar a próxima extração.

### Estado final do projeto

- **Frontend Angular** (componentes standalone, o padrão desta versão do CLI): `App` (orquestra o board), `CardItemComponent` (renderiza um card), `KanbanApiService` (fala HTTP com o backend), `KanbanStateService` (mantém e notifica o estado compartilhado via `BehaviorSubject`), `CardCountComponent` (exemplo ilustrativo de consumo do estado compartilhado).
- **Backend Spring Boot**: `CardController` (rotas HTTP), `KanbanService` (regras de negócio), `CardRepository` (persistência via Spring Data JPA), `Card`/`ColunaEnum`/`EtiquetaEnum`/`ColunaRequest` (domínio e contratos de API).
- **Persistência real** em MySQL, rodando em um container Docker (`docker-compose.yml`), com os dados guardados em um volume Docker, sobrevivendo a reinícios do backend, do container e do próprio banco.
- **Arrastar-e-soltar** funcional entre as três colunas fixas, com a coluna persistida (a posição relativa dentro da coluna não é).
- **Sem autenticação, sem múltiplos boards, sem tempo real entre abas**, por decisão consciente registrada acima, não por limitação técnica.

### Para refletir no seu `LOG.md`

- Em que ponto deste tutorial uma extração pareceu chegar tarde (o problema já era perceptível havia algumas etapas) ou cedo (a abstração criada ficou sem um segundo uso real de imediato)?
- O paralelo entre `NotifierService` (Sudoku) e `KanbanStateService`/`BehaviorSubject` (aqui) foi útil, ou a tecnologia diferente (Observer escrito à mão versus RxJS) tornou a comparação menos clara do que ajudou?
- Das cinco tentações descartadas na seção anterior, qual seria a próxima a valer a pena, se este projeto continuasse? O que, especificamente, precisaria se tornar uma necessidade real primeiro, para justificar essa extração?

Como no Sudoku, não existe resposta certa aqui. O valor de fechar um projeto documentando por que se parou é o mesmo valor de documentar por que se continuou em cada etapa anterior: as duas são decisões de engenharia, e as duas merecem estar registradas no LOG.
