# Spec — Gestão de qualificações e reativação de pessoa

## Contexto

Auditoria comparando os endpoints documentados no Swagger (`/docs`) contra o que `front/src/api.ts` efetivamente consome encontrou duas lacunas funcionais reais (não apenas endpoints de "buscar por id" que hoje são dispensáveis porque o front já tem o dado via list):

1. `PATCH /pessoa/:id/reativar` não é chamado em lugar nenhum do front. `PessoasPage.tsx` só oferece "Excluir" (que é soft-delete/inativação); não existe caminho na UI para reverter isso.
2. `DELETE /pessoa/:pessoaId/qualificacao/:funcaoId` não existe em `api.ts`. A única chamada de qualificação hoje é `setQualificacao` (PUT), usada uma única vez no formulário de criação de pessoa (`PessoasPage.tsx:77`). Depois que a pessoa é criada, não há tela para ver, adicionar ou remover suas qualificações.

O backend já expõe tudo que é necessário para fechar as duas lacunas — o trabalho é só de front.

## Escopo

### 1. Reativar pessoa
- Pessoas inativas devem aparecer na listagem (hoje `GET /pessoa` sem filtro já deve incluí-las — confirmar comportamento do backend antes de desenhar a UI).
- Distinguir visualmente pessoa ativa/inativa na lista.
- Botão "Reativar" no lugar de "Excluir" quando a pessoa estiver inativa, chamando `PATCH /pessoa/:id/reativar`.

### 2. Gestão de qualificações de uma pessoa existente
- Nova função em `api.ts`: `removeQualificacao(pessoaId, funcaoId)` → `DELETE /pessoa/:pessoaId/qualificacao/:funcaoId`.
- Nova função em `api.ts`: `listQualificacoes(pessoaId)` → `GET /pessoa/:id/qualificacoes` (retorna, para cada função, se a pessoa está qualificada — ver `QualificacaoFuncaoDto`).
- UI: um jeito de abrir a "ficha" de uma pessoa já cadastrada e, por ministério, marcar/desmarcar as funções que ela pode exercer (checkboxes ou toggle por função), refletindo `setQualificacao`/`removeQualificacao` a cada mudança.
- O fluxo de criação (`newFuncaoId` no formulário de criar pessoa) continua existindo como atalho para já sair qualificada em uma função — não precisa mudar.

## Fora de escopo (não fazer agora)
- Endpoints de "buscar por id" isolados (`GET /pessoa/:id`, `GET /culto/:id`, `GET /funcao/:id`, `GET /ministerio/:id`) — sem necessidade concreta hoje, já que as listas carregam os dados.
- Qualquer regra de negócio nova (teto de escalas, pares, etc.) — fora do horizonte do sprint atual conforme `CLAUDE.md`.
