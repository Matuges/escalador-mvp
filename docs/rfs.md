# Requisitos funcionais

## Cadastros
RF01 — O sistema deve permitir cadastrar, editar e inativar pessoas (voluntários).
RF02 — O sistema deve permitir cadastrar ministérios e suas funções.
RF03 — O sistema deve permitir registrar as qualificações de cada pessoa (em quais funções ela pode servir).
RF04 — O sistema deve permitir cadastrar tipos de culto recorrentes e eventos pontuais.

## Formulário mensal de disponibilidade
RF05 — O sistema deve gerar um link individual por token para cada pessoa a cada ciclo.
RF06 — O sistema deve permitir que a pessoa informe sua disponibilidade sem necessidade de login.
RF07 — O formulário deve exibir as datas do ciclo em que a pessoa pode ser escalada.
RF08 — O sistema deve permitir marcar indisponibilidade por data.
RF09 — O sistema deve registrar a data/hora de envio da resposta.
RF10 — O sistema deve permitir que a pessoa reenvie/atualize sua resposta enquanto o prazo estiver aberto.
RF11 — O sistema deve indicar ao administrador quem já respondeu e quem está pendente.
RF12 — O sistema deve respeitar um prazo de resposta definido pelo administrador.
RF13 — O sistema deve invalidar o token após o encerramento do ciclo.

## Regras de customização
RF14 — O sistema deve permitir definir um teto de escalas por pessoa no ciclo.
RF15 — O sistema deve permitir registrar pares de pessoas que devem servir juntas.
RF16 — O sistema deve permitir registrar pares de pessoas que devem ser evitados juntos.
RF17 — O sistema deve permitir definir a demanda de cada função por tipo de culto.
RF18 — O sistema deve permitir fixar manualmente uma pessoa em uma alocação.
RF19 — O sistema deve permitir registrar indisponibilidades fixas (recorrentes) além das do ciclo.

## Geração da escala
RF20 — O sistema deve permitir gerar a escala de um ministério isoladamente.
RF21 — O sistema deve permitir gerar a escala de todos os ministérios de uma vez.

## Escalas candidatas
RF22 — O sistema deve produzir mais de uma escala candidata para o mesmo ciclo.
RF23 — O sistema deve apresentar um resumo dos trade-offs de cada candidata.
RF24 — O sistema deve permitir ao administrador comparar as candidatas.
RF25 — O sistema deve permitir escolher uma candidata como escala oficial.
RF26 — O sistema deve permitir descartar as candidatas não escolhidas.

## Revisão e histórico
RF27 — O sistema deve permitir editar manualmente a escala oficial após a geração.
RF28 — O sistema deve manter o histórico das escalas de ciclos anteriores.

## Exportação
RF29 — O sistema deve exportar a escala como imagem.
RF30 — O sistema deve exportar a escala como planilha.
RF31 — O sistema deve permitir exportar por ministério ou completa.
