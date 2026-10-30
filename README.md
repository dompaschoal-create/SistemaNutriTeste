# Diário Escolar Eletrônico - Vercel Postgres

Sistema de gestão escolar e diário de classe eletrônico desenvolvido com **Next.js**, **Vanilla CSS** e integrado ao **Vercel Postgres (Neon)**.

---

## 🎯 Funcionalidades

- **Autenticação de Docente**: Login seguro com `NIF` (identificador numérico inteiro) e `Senha`.
- **Painel de Turmas**: Visualização de todas as turmas vinculadas ao docente (`Professor_Turma` ↔ `Turma`), com turno, período, total de alunos, empresa parceira e status do diário.
- **Diário de Classe & Lançamento de Notas**:
  - Consulta aos alunos matriculados na turma (`Aluno_Turma` ↔ `Aluno`).
  - Lançamento de **Notas** (0.0 a 10.0) com feedback visual de aprovação/reprovação.
  - Controle de **Frequência e Faltas** com cálculo de percentual de presença.
  - Atualização do **Status Final** do aluno (`Matriculado`, `Aprovado`, `Reprovado`, etc.).
  - Atualização automática do status do diário do professor para **"Em dia"** após o salvamento.
- **Resiliência e Zero-Config**: Conecta nativamente ao Vercel Postgres quando a variável `POSTGRES_URL` estiver configurada, mantendo fallback resiliente com os dados do seed para teste imediato.

---

## 🔑 Credenciais para Demonstração

| Docente | NIF | Senha | Turmas Atribuídas |
| :--- | :---: | :---: | :--- |
| **Prof. Carlos Eduardo Silva** | `1001` | `123456` | Turma #101 (Dev Web), Turma #102 (Banco de Dados) |
| **Profa. Mariana Costa Guimarães** | `1002` | `123456` | Turma #102 (Banco de Dados) |
| **Prof. Roberto de Almeida Prado** | `1003` | `123456` | Turma #103 (Gestão e Segurança) |

---

## 🏛️ Estrutura do Banco de Dados (SQL)

- **`Docente`**: `nif` (INT PK), `nome`, `senha`
- **`Aluno`**: `matricula` (INT PK), `nome`
- **`Turma`**: `codigo` (INT PK), `nome_curso`, `quantidade_maxima`, `empresa`, `nome_empresa`, `turno`, `data_ini`, `data_fim`
- **`Professor_Turma`**: `id` (INT PK), `codigo_turma` (FK), `nif_docente` (FK), `status_diario`
- **`Aluno_Turma`**: `id` (INT PK), `codigo_turma_aluno` (FK), `matricula_aluno` (FK), `nota`, `faltas`, `presenca_percentual`, `status_final`

---

## 🚀 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Executar servidor de desenvolvimento
npm run dev

# Acesse no navegador: http://localhost:3000
```
