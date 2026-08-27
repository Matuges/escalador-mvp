# Spec — Ajustes de perfil de pessoa, filtro por ministério e busca na Escala

## Contexto

Três incômodos de UX levantados no uso do front atual:

1. **Perfil de pessoa lista todos os ministérios.** A aba "Qualificações" em
   `front/src/pages/PessoaDetailPage.tsx` renderiza `porMinisterio`, que vem de
   `listQualificacoes` — e esse endpoint devolve **toda** função de **todo**
   ministério com um booleano `qualificado`. Resultado: quem participa só de
   "Louvor" ainda vê "Recepção", "Mídia", etc., todos vazios.
2. **Selecionar só o ministério no filtro não filtra nada.** `MinisterioFuncaoSelect`
   guarda `{ ministerioId, funcaoId }`, mas as telas que o consomem só repassam
   `funcaoId` para a API (`EscalaPage.tsx:60`, `PessoasPage.tsx:45`). Enquanto o
   usuário não escolhe uma função específica, a lista continua mostrando todo mundo.
   O esperado: escolher "Louvor" já restringe a quem exerce **qualquer** função de
   Louvor.
3. **Não há busca por nome na aba Escala.** `PessoasPage` já tem um campo "Buscar
   por nome…" (`PessoasPage.tsx:173`), mas `EscalaPage` não — em um culto com muita
   gente, achar uma pessoa específica exige rolar a lista inteira.

## O que exige mudança na API

Só o **item 2**. Filtrar por ministério precisa de um parâmetro novo
(`ministerioId`) em dois endpoints de listagem e da lógica de filtro no service —
ver **`subspec-api-filtro-por-ministerio.md`**, a ser implementada em branch
separada (a partir de `main`) e mergeada antes da Task 2 abaixo.

Itens 1 e 3 são 100% front: os dados necessários já chegam nas respostas atuais.

---

## Tasks (branch atual: `front`)

### Task 1 — Perfil mostra só os ministérios em que a pessoa tem função

**Arquivo:** `front/src/pages/PessoaDetailPage.tsx`

- `porMinisterio` já tem, em memória, todas as funções agrupadas por ministério com
  o flag `qualificado`. A mudança é de **renderização**, não de dados: exibir por
  padrão apenas os grupos com pelo menos uma função `qualificado === true`.
- Manter um caminho para **adicionar** função de um ministério em que a pessoa
  ainda não participa (senão não há como qualificá-la pela primeira vez). Sugestão:
  um botão "Adicionar função" que revela os grupos restantes (mesma lista já
  carregada, sem novo fetch), reaproveitando o padrão visual de checkbox por função
  que já existe na aba.
- O contador da aba ("Qualificações", `totalQualificado`) continua contando só as
  qualificadas — nada muda ali.
- Estado vazio: se a pessoa não tem nenhuma função ainda, mostrar o `EmptyState`
  atual, mas com o botão "Adicionar função" visível.

**Decisão em aberto (sua):** botão que expande os demais ministérios *inline* vs.
um seletor de ministério à parte (estilo `QualificacoesPicker`). O primeiro é mais
simples e não precisa de novo request.

**Feito quando:** abrir o perfil de alguém que só serve no Louvor mostra apenas
Louvor; dá para adicionar uma função de outro ministério e ela passa a aparecer.

---

### Task 2 — Filtro por ministério aplica `ministerioId` (depende da subspec da API)

**Arquivos:** `front/src/api.ts`, `front/src/pages/EscalaPage.tsx`,
`front/src/pages/PessoasPage.tsx`

- Depende de `subspec-api-filtro-por-ministerio.md` estar mergeada.
- `api.ts`: `findDisponibilidadesPorCulto` e `listPessoas` passam a aceitar e enviar
  `ministerioId` (query param), no mesmo padrão do `funcaoId` atual
  (`URLSearchParams`, só inclui quando `!= null`).
- `EscalaPage.tsx`: o `useEffect` que chama `findDisponibilidadesPorCulto` hoje
  depende de `mf.funcaoId`. Passar a depender também de `mf.ministerioId` e
  repassá-lo. Ajustar as mensagens de `EmptyState` (`EscalaPage.tsx:167`) para o
  caso "nenhuma pessoa neste ministério".
- `PessoasPage.tsx`: mesma ideia no `useEffect` de `listPessoas` e nas dependências.
- Contrato de precedência (definido na subspec): quando `funcaoId` vem junto, ele
  vence; `ministerioId` sozinho filtra pelo ministério inteiro. O front não precisa
  tratar isso — só mandar os dois quando existirem.

**Feito quando:** na Escala e em Pessoas, escolher um ministério sem escolher
função já reduz a lista a quem tem alguma função naquele ministério.

---

### Task 3 — Barra de busca por pessoa na aba Escala

**Arquivo:** `front/src/pages/EscalaPage.tsx`

- Espelhar o que `PessoasPage` já faz: estado `busca`, `<input>` com
  `placeholder="Buscar por nome…"` e `controlClass`, filtro por
  `nome.toLowerCase().includes(termo.trim().toLowerCase())`.
- Encaixar o filtro de texto dentro do `useMemo` `exibidas` (`EscalaPage.tsx:76`),
  **antes** do `.sort`, combinando com o filtro de `status` que já existe.
- Posição sugerida: acima do `Segmented` de status, ou dentro do mesmo bloco do
  `MinisterioFuncaoSelect`. Não criar componente novo se for um `<input>` só;
  se o padrão "campo de busca" se repetir, aí sim extrair depois.
- Ajustar o `EmptyState` "Nada neste filtro" para cobrir também "nada bate com a
  busca".

### Task 4 - Bug fix 

**Feito quando:** digitar parte de um nome na Escala filtra a lista em tempo real,
somando aos filtros de ministério/função/status.

- Cancelamento nos effects de fetch: let ativo = true no effect + return () => { ativo = false }, e só chamar setX/notificar se ativo. Mata os efeitos duplos do StrictMode e as race conditions de navegação de uma vez.
- Não zerar pra null em refetch por filtro/param — manter os dados antigos na tela enquanto carrega (ou useTransition) elimina a piscada.
- Consolidar erros: trocar os 3 .catch(notificar) por um Promise.allSettled + um único toast.
- Deduplicar no ToastProvider: se mensagem+tone já existe, não empilha (ou reinicia o timer).
- EscalaPage: computar o culto-alvo com useMemo e renderizar <Navigate> em vez de navigate() no effect.

---

## Ordem sugerida

1. Task 1 e Task 3 (independentes, só front) — em qualquer ordem.
2. Subspec da API em branch própria → merge.
3. Task 2.

## Fora de escopo

- Extrair um componente `CampoBusca` compartilhado entre `PessoasPage` e
  `EscalaPage` — só se um terceiro uso aparecer.
- Busca no servidor / paginação — a lista de um culto é pequena, filtro em memória
  basta.
- Qualquer regra de negócio nova (demanda por função, teto de escalas) — fora do
  sprint atual conforme `CLAUDE.md`.
