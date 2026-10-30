-- ==============================================================================
-- CONSULTAS DE EXEMPLO DEMONSTRANDO OS RELACIONAMENTOS (JOINS)
-- ==============================================================================

-- 1. Relacionamento Turma x Aluno (via Aluno_Turma)
-- Lista todas as turmas, seus cursos e os alunos matriculados com o status final
SELECT 
    t.codigo AS codigo_turma,
    t.nome_curso,
    t.turno,
    a.matricula AS matricula_aluno,
    a.nome AS nome_aluno,
    at.status_final
FROM Aluno_Turma at
INNER JOIN Turma t ON t.codigo = at.codigo_turma_aluno
INNER JOIN Aluno a ON a.matricula = at.matricula_aluno
ORDER BY t.codigo, a.nome;


-- 2. Relacionamento Turma x Docente (via Professor_Turma)
-- Lista todas as turmas e os professores atribuídos com o status do diário
SELECT 
    t.codigo AS codigo_turma,
    t.nome_curso,
    t.turno,
    t.empresa,
    t.nome_empresa,
    d.nif AS nif_docente,
    d.nome AS nome_docente,
    pt.status_diario
FROM Professor_Turma pt
INNER JOIN Turma t ON t.codigo = pt.codigo_turma
INNER JOIN Docente d ON d.nif = pt.nif_docente
ORDER BY t.codigo, d.nome;


-- 3. Visão Geral Completa por Turma (Docentes e Total de Alunos Matriculados)
SELECT 
    t.codigo AS codigo_turma,
    t.nome_curso,
    t.turno,
    t.quantidade_maxima,
    COUNT(DISTINCT at.matricula_aluno) AS total_alunos_matriculados,
    STRING_AGG(DISTINCT d.nome, ', ') AS docentes_responsaveis
FROM Turma t
LEFT JOIN Professor_Turma pt ON pt.codigo_turma = t.codigo
LEFT JOIN Docente d ON d.nif = pt.nif_docente
LEFT JOIN Aluno_Turma at ON at.codigo_turma_aluno = t.codigo
GROUP BY t.codigo, t.nome_curso, t.turno, t.quantidade_maxima;
