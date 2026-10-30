-- ==============================================================================
-- DADOS INICIAIS DE TESTE (SEED) - DIÁRIO ELETRÔNICO
-- ==============================================================================

-- 1. Inserindo Docentes com Senha para Login
INSERT INTO Docente (nif, nome, senha) VALUES
(1001, 'Prof. Carlos Eduardo Silva', '123456'),
(1002, 'Profa. Mariana Costa Guimarães', '123456'),
(1003, 'Prof. Roberto de Almeida Prado', '123456');

-- 2. Inserindo Alunos
INSERT INTO Aluno (matricula, nome) VALUES
(202401, 'Ana Beatriz Ramos'),
(202402, 'Lucas Fernandes Lima'),
(202403, 'Juliana Martins Rocha'),
(202404, 'Gabriel Souza Ribeiro'),
(202405, 'Camila Nogueira Duarte');

-- 3. Inserindo Turmas
INSERT INTO Turma (codigo, nome_curso, quantidade_maxima, empresa, nome_empresa, turno, data_ini, data_fim) VALUES
(101, 'Desenvolvimento Web Fullstack', 35, FALSE, NULL, 'Noturno', '2026-02-15', '2026-06-30'),
(102, 'Banco de Dados e Análise de Dados', 30, TRUE, 'Tech Soluções S.A.', 'Vespertino', '2026-03-01', '2026-07-15'),
(103, 'Gestão e Segurança da Informação', 25, FALSE, NULL, 'Matutino', '2026-02-20', '2026-06-25');

-- 4. Relacionando Docente e Turma (Professor_Turma)
INSERT INTO Professor_Turma (codigo_turma, nif_docente, status_diario) VALUES
(101, 1001, 'Em dia'),
(102, 1001, 'Pendente'),
(102, 1002, 'Em dia'),
(103, 1003, 'Em dia');

-- 5. Relacionando Alunos e Turmas com Notas e Faltas (Aluno_Turma)
INSERT INTO Aluno_Turma (codigo_turma_aluno, matricula_aluno, status_final, nota, faltas, presenca_percentual) VALUES
(101, 202401, 'Matriculado', 9.50, 1, 95.00),
(101, 202402, 'Matriculado', 8.00, 2, 90.00),
(101, 202403, 'Matriculado', 6.50, 4, 80.00),
(102, 202403, 'Matriculado', 8.50, 0, 100.00),
(102, 202404, 'Matriculado', 7.00, 1, 95.00),
(103, 202405, 'Matriculado', 10.00, 0, 100.00);
