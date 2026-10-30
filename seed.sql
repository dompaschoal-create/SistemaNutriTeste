-- ==============================================================================
-- DADOS INICIAIS DE TESTE (SEED) - SISTEMA DE GESTÃO ESCOLAR
-- ==============================================================================

-- 1. Inserindo Docentes (Identificador NIF como inteiro)
INSERT INTO Docente (nif, nome) VALUES
(1001, 'Prof. Carlos Eduardo Silva'),
(1002, 'Profa. Mariana Costa Guimarães'),
(1003, 'Prof. Roberto de Almeida Prado');

-- 2. Inserindo Alunos (Identificador Matricula como inteiro)
INSERT INTO Aluno (matricula, nome) VALUES
(202401, 'Ana Beatriz Ramos'),
(202402, 'Lucas Fernandes Lima'),
(202403, 'Juliana Martins Rocha'),
(202404, 'Gabriel Souza Ribeiro'),
(202405, 'Camila Nogueira Duarte');

-- 3. Inserindo Turmas (Identificador Codigo como inteiro)
INSERT INTO Turma (codigo, nome_curso, quantidade_maxima, empresa, nome_empresa, turno, data_ini, data_fim) VALUES
(101, 'Desenvolvimento Web Fullstack', 35, FALSE, NULL, 'Noturno', '2026-02-15', '2026-06-30'),
(102, 'Banco de Dados e Análise de Dados', 30, TRUE, 'Tech Soluções S.A.', 'Vespertino', '2026-03-01', '2026-07-15'),
(103, 'Gestão e Segurança da Informação', 25, FALSE, NULL, 'Matutino', '2026-02-20', '2026-06-25');

-- 4. Relacionando Docente e Turma (Tabela Professor_Turma)
-- ID é inteiro gerado automaticamente
INSERT INTO Professor_Turma (codigo_turma, nif_docente, status_diario) VALUES
(101, 1001, 'Em dia'),
(102, 1002, 'Pendente'),
(103, 1003, 'Em dia'),
(101, 1003, 'Em dia'); -- Uma turma pode ter mais de um docente especialista

-- 5. Relacionando Aluno e Turma (Tabela Aluno_Turma)
-- ID é inteiro gerado automaticamente
INSERT INTO Aluno_Turma (codigo_turma_aluno, matricula_aluno, status_final) VALUES
(101, 202401, 'Matriculado'),
(101, 202402, 'Matriculado'),
(101, 202403, 'Aprovado'),
(102, 202403, 'Matriculado'),
(102, 202404, 'Matriculado'),
(103, 202405, 'Matriculado');
