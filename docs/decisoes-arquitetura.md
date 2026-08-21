# Tecnologias e arquitetura
## Frontend
React com Vite e Tailwind, usando os componentes do shadcn/ui. A aplicação é uma SPA estática: o Vite compila para arquivos estáticos servidos diretamente, sem servidor Node em runtime no front. O React dá conta tanto do painel administrativo quanto do formulário público de disponibilidade; o Tailwind e o shadcn aceleram a construção da interface sem exigir um design system próprio. Como o formulário público precisa ser simples e acessível por qualquer voluntário, a leveza da SPA estática ajuda.

## API
NestJS com Prisma como ORM. O Nest organiza a API em módulos (pessoas, ministérios, escalas, disponibilidade, exportação), o que casa bem com a divisão por domínio do sistema. O Prisma é a camada de acesso ao banco e a fonte de verdade do modelo de dados — o schema.prisma gera tanto as migrações quanto o client tipado consumido pela API. Toda a lógica de negócio, autenticação do painel e emissão dos tokens do formulário vivem aqui.

## Banco de dados
PostgreSQL. Relacional, que é o encaixe natural para o modelo (pessoas, ministérios, funções, qualificações, escalas, alocações — tudo com relacionamentos bem definidos e restrições de integridade). Roda em container.

## Motor de geração (solver)
Serviço separado em Python, usando o CP-SAT do Google OR-Tools para resolver a alocação como um problema de restrições. Vale registrar o motivo de ele ser isolado: não é adesão a microsserviços, e sim duas razões concretas — incompatibilidade de linguagem (OR-Tools é Python; o resto é JS/TS) e isolamento de falha (se o solver travar ou consumir muito, ele não derruba a API). O plano é começar com uma heurística em TypeScript dentro da própria API para validar o fluxo ponta a ponta, e só depois promover a geração para o serviço Python com CP-SAT quando as restrições justificarem a otimização de verdade.

## Exportação
Duas bibliotecas, uma para cada formato. ExcelJS gera a planilha (RF30). Para a imagem (RF29), satori converte a marcação em SVG e resvg rasteriza o SVG em PNG — o mesmo par usado para gerar imagens a partir de layout declarativo.

## Infraestrutura e deploy
Caddy como proxy reverso, cuidando do roteamento entre front, API e solver, e resolvendo HTTPS automaticamente (certificado sem configuração manual). Tudo publicado em uma VPS — a escolha por VPS em vez de servidor local na igreja elimina as preocupações com energia, IP dinâmico e disponibilidade, por um custo mensal baixo.

## Estrutura do projeto
Monorepo com quatro workspaces — /front, /api, /solver, /caddy — orquestrados por um único docker-compose.yml. Conceitualmente, isto é um monolito multi-container com um serviço auxiliar, não uma arquitetura de microsserviços: front, API e banco formam o núcleo coeso, e o solver é o único satélite, isolado pelas razões já descritas.
