-- ==============================================================================
-- SISTEMA DE GESTÃO ESCOLAR - ESQUEMA DE BANCO DE DADOS (SQL / VERCEL POSTGRES)
-- Dialeto: PostgreSQL (Compatível nativamente com Vercel Postgres / Neon)
-- ==============================================================================

-- 1. Remoção prévia das tabelas caso já existam (ordem respeitando as foreign keys)
DROP TABLE IF EXISTS Aluno_Turma CASCADE;
DROP TABLE IF EXISTS Professor_Turma CASCADE;
DROP TABLE IF EXISTS Turma CASCADE;
DROP TABLE IF EXISTS Aluno CASCADE;
DROP TABLE IF EXISTS Docente CASCADE;

-- ==============================================================================
-- TABELA: Docente
-- ==============================================================================
CREATE TABLE Docente (
    nif INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

COMMENT ON TABLE Docente IS 'Tabela que armazena os dados dos professores/docentes';
COMMENT ON COLUMN Docente.nif IS 'Identificador único do docente (inteiro)';
COMMENT ON COLUMN Docente.nome IS 'Nome completo do docente';

-- ==============================================================================
-- TABELA: Aluno
-- ==============================================================================
CREATE TABLE Aluno (
    matricula INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

COMMENT ON TABLE Aluno IS 'Tabela que armazena os dados dos alunos';
COMMENT ON COLUMN Aluno.matricula IS 'Identificador único do aluno (inteiro)';
COMMENT ON COLUMN Aluno.nome IS 'Nome completo do aluno';

-- ==============================================================================
-- TABELA: Turma
-- ==============================================================================
CREATE TABLE Turma (
    codigo INT PRIMARY KEY,
    nome_curso VARCHAR(150) NOT NULL,
    quantidade_maxima INT NOT NULL CHECK (quantidade_maxima > 0),
    empresa BOOLEAN NOT NULL DEFAULT FALSE,
    nome_empresa VARCHAR(150) NULL,
    turno VARCHAR(30) NOT NULL,
    data_ini DATE NOT NULL,
    data_fim DATE NOT NULL,
    CONSTRAINT chk_periodo_datas CHECK (data_fim >= data_ini)
);

COMMENT ON TABLE Turma IS 'Tabela que armazena as turmas ofertadas';
COMMENT ON COLUMN Turma.codigo IS 'Identificador único da turma (inteiro)';
COMMENT ON COLUMN Turma.empresa IS 'Indica se a turma é corporativa/vinculada à empresa (boolean)';
COMMENT ON COLUMN Turma.turno IS 'Turno das aulas (ex: Matutino, Vespertino, Noturno, Integral)';

-- ==============================================================================
-- TABELA: Professor_Turma (Relacionamento N:N entre Docente e Turma)
-- ==============================================================================
CREATE TABLE Professor_Turma (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_turma INT NOT NULL,
    nif_docente INT NOT NULL,
    status_diario VARCHAR(50) NOT NULL DEFAULT 'Pendente',
    CONSTRAINT fk_professor_turma_turma 
        FOREIGN KEY (codigo_turma) 
        REFERENCES Turma (codigo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_professor_turma_docente 
        FOREIGN KEY (nif_docente) 
        REFERENCES Docente (nif) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT uq_turma_docente 
        UNIQUE (codigo_turma, nif_docente)
);

COMMENT ON TABLE Professor_Turma IS 'Tabela associativa que vincula docentes às turmas';
COMMENT ON COLUMN Professor_Turma.id IS 'Identificador primário da associação (inteiro auto-incremento)';
COMMENT ON COLUMN Professor_Turma.status_diario IS 'Status do preenchimento do diário de classe pelo docente';

-- ==============================================================================
-- TABELA: Aluno_Turma (Relacionamento N:N entre Aluno e Turma)
-- ==============================================================================
CREATE TABLE Aluno_Turma (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_turma_aluno INT NOT NULL,
    matricula_aluno INT NOT NULL,
    status_final VARCHAR(50) NOT NULL DEFAULT 'Matriculado',
    CONSTRAINT fk_aluno_turma_turma 
        FOREIGN KEY (codigo_turma_aluno) 
        REFERENCES Turma (codigo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_turma_aluno 
        FOREIGN KEY (matricula_aluno) 
        REFERENCES Aluno (matricula) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT uq_turma_aluno 
        UNIQUE (codigo_turma_aluno, matricula_aluno)
);

COMMENT ON TABLE Aluno_Turma IS 'Tabela associativa que registra a matrícula dos alunos nas turmas';
COMMENT ON COLUMN Aluno_Turma.id IS 'Identificador primário da matrícula (inteiro auto-incremento)';
COMMENT ON COLUMN Aluno_Turma.status_final IS 'Situação final do aluno (ex: Matriculado, Aprovado, Reprovado, Cancelado)';

-- ==============================================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS E JOINS
-- ==============================================================================
CREATE INDEX idx_prof_turma_cod ON Professor_Turma(codigo_turma);
CREATE INDEX idx_prof_turma_nif ON Professor_Turma(nif_docente);
CREATE INDEX idx_aluno_turma_cod ON Aluno_Turma(codigo_turma_aluno);
CREATE INDEX idx_aluno_turma_mat ON Aluno_Turma(matricula_aluno);
