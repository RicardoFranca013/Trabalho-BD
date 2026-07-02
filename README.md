# Sistema de Controle de Matrículas

Trabalho Prático — Banco de Dados I / LBD I — CEFET-MG — 1º Semestre de 2026

`Oracle Database` · `PHP 8` · `HTML/CSS/JS`

---

## Sobre o sistema

Sistema de gerenciamento de matrículas acadêmicas desenvolvido como Trabalho Prático da disciplina de Banco de Dados I / Laboratório de Banco de Dados I, ministrada pelo Prof. Evandrino no CEFET-MG.

O sistema modela o fluxo de uma instituição de ensino: **departamentos** oferecem **cursos**, cada curso tem um **professor coordenador** e reúne várias **disciplinas**; professores lecionam **turmas** de uma disciplina em um semestre/ano específico; e **alunos** se **matriculam** nessas turmas, recebendo nota e frequência ao final. Toda regra de negócio (limites de vagas, status do aluno, faixas válidas de nota/frequência, etc.) é garantida por triggers no próprio banco, não no código da aplicação.

## Funcionalidades

- CRUD completo para as 7 entidades do sistema: Aluno, Professor, Curso, Departamento, Disciplina, Turma e Matrícula
- 5 tipos de relatório SQL: inner join, outer join (left join), group by, having e subquery aninhada
- 8 triggers de regras de negócio aplicadas diretamente no banco Oracle
- Conexão autenticada via Oracle Wallet (mTLS) com o Oracle Autonomous Database (Oracle Cloud)
- Seleção de chaves estrangeiras via dropdown (nenhum campo de FK é digitado manualmente)
- Feedback visual de sucesso/erro via toasts, com as mensagens de negócio dos triggers repassadas de forma legível

## Estrutura do projeto

```
projeto/
├── database/
│   ├── banco.sql          # DDL: criação das tabelas e triggers
│   └── povoamento.sql     # DML: inserção dos dados iniciais
├── backend/
│   ├── config/
│   │   └── database.php   # Conexão Oracle via oci8 + wallet
│   └── api/
│       ├── alunos/        # CRUD: listar, inserir, alterar, deletar
│       ├── professores/
│       ├── cursos/
│       ├── departamentos/
│       ├── disciplinas/
│       ├── turmas/
│       ├── matriculas/
│       └── relatorios/    # 5 endpoints de relatório SQL
├── frontend/
│   ├── index.html         # SPA com navegação por seções
│   ├── app.js             # Lógica de CRUD e relatórios via fetch
│   └── style.css          # Estilo visual (paleta pastel, Inter)
├── .env.example           # Variáveis de ambiente necessárias
└── README.md
```

## Schema do banco

| Tabela | Chave Primária | Relacionamentos |
|--------|---------------|-----------------|
| DEPARTAMENTO | cod_departamento | — |
| PROFESSOR | matricula | — |
| CURSO | cod_curso | DEPARTAMENTO, PROFESSOR |
| ALUNO | matricula | CURSO |
| DISCIPLINA | cod_disciplina | — |
| TURMA | semestre+num_turma+ano+cod_disciplina | PROFESSOR, DISCIPLINA |
| MATRICULA | matricula_aluno+semestre+num_turma+ano+cod_disciplina | ALUNO, TURMA |
| COMPOE | cod_curso+cod_disciplina | CURSO, DISCIPLINA |

## Regras de negócio (triggers)

| Trigger | Regra |
|---------|-------|
| valida_carga_horaria | Carga horária do curso deve ser > 100h |
| valida_sexo_aluno | Sexo deve ser 'M' ou 'F' |
| valida_creditos_disciplina | Créditos da disciplina devem ser > 0 |
| valida_dados_turma | Semestre (1 ou 2), vagas > 0, ano ≥ 2027 |
| valida_desempenho_matricula | Nota e frequência entre 0 e 100 |
| bloqueia_turma_lotada | Impede matrícula em turma sem vagas disponíveis |
| valida_status_permitidos | Status do aluno: ATIVO, TRANCADO, FORMADO ou INATIVO |
| bloqueia_matricula_por_status | Impede matrícula de aluno TRANCADO, FORMADO ou INATIVO |

## Relatórios SQL disponíveis

| Endpoint | Tipo | Descrição |
|----------|------|-----------|
| relatorios/inner_join.php | INNER JOIN | Alunos com seus respectivos cursos e departamentos |
| relatorios/outer_join.php | LEFT JOIN | Professores com ou sem turma atribuída |
| relatorios/group_by.php | GROUP BY | Quantidade de alunos por curso |
| relatorios/having.php | HAVING | Cursos com mais de 5 alunos matriculados |
| relatorios/subquery.php | Subquery | Alunos com rendimento acima da média geral |

## Pré-requisitos

- PHP 8.x com extensão `oci8` instalada via PECL
- Oracle Instant Client 23.x (ARM64 para Apple Silicon)
- Oracle Wallet configurado para o banco do curso
- Arquivo `sqlnet.ora` com `DIRECTORY` apontando para o caminho absoluto da wallet (não `?/network/admin`)

## Como rodar localmente

1. Clonar o repositório
2. Copiar `.env.example` para `.env` e preencher com as credenciais reais
3. Garantir que `oci8` está ativo: `php -m | grep oci8`
4. Configurar o `sqlnet.ora` da wallet com o caminho absoluto
5. Rodar o banco: executar `database/banco.sql` e depois `database/povoamento.sql` no SQL Developer (F5)
6. Subir o servidor PHP na raiz do projeto: `php -S localhost:8000`
7. Acessar no navegador: `http://localhost:8000/frontend/index.html`
8. Testar conexão: `http://localhost:8000/backend/test_connection.php`

## Integrantes do grupo

- Nome Completo — Matrícula
- Nome Completo — Matrícula
- Nome Completo — Matrícula
- Nome Completo — Matrícula
