-- ==============================================================================
-- SISTEMA DE GESTÃO ESCOLAR - DIÁRIO ELETRÔNICO (SQL / VERCEL POSTGRES)
-- Dialeto: PostgreSQL (Compatível nativamente com Vercel Postgres / Neon)
-- ==============================================================================

-- 1. Remoção prévia das tabelas respeitando as constraints de integridade
DROP TABLE IF EXISTS Diario_Registro CASCADE;
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
    nome VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL DEFAULT '123456'
);

COMMENT ON TABLE Docente IS 'Tabela que armazena os dados dos professores/docentes';
COMMENT ON COLUMN Docente.nif IS 'Identificador único do docente (inteiro)';
COMMENT ON COLUMN Docente.nome IS 'Nome completo do docente';
COMMENT ON COLUMN Docente.senha IS 'Senha de acesso ao diário eletrônico';

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
-- TABELA: Professor_Turma (Relacionamento Docente <-> Turma)
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

-- ==============================================================================
-- TABELA: Aluno_Turma (Relacionamento Aluno <-> Turma com Notas e Frequência)
-- ==============================================================================
CREATE TABLE Aluno_Turma (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_turma_aluno INT NOT NULL,
    matricula_aluno INT NOT NULL,
    status_final VARCHAR(50) NOT NULL DEFAULT 'Matriculado',
    nota NUMERIC(4,2) DEFAULT NULL,
    faltas INT NOT NULL DEFAULT 0,
    presenca_percentual NUMERIC(5,2) DEFAULT 100.00,
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

-- ==============================================================================
-- TABELA: Diario_Registro (Aulas ministradas e chamada diária)
-- ==============================================================================
CREATE TABLE Diario_Registro (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_turma INT NOT NULL,
    nif_docente INT NOT NULL,
    data_aula DATE NOT NULL DEFAULT CURRENT_DATE,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diario_turma FOREIGN KEY (codigo_turma) REFERENCES Turma(codigo) ON DELETE CASCADE,
    CONSTRAINT fk_diario_docente FOREIGN KEY (nif_docente) REFERENCES Docente(nif) ON DELETE CASCADE
);

-- ==============================================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS E JOINS
-- ==============================================================================
CREATE INDEX idx_prof_turma_cod ON Professor_Turma(codigo_turma);
CREATE INDEX idx_prof_turma_nif ON Professor_Turma(nif_docente);
CREATE INDEX idx_aluno_turma_cod ON Aluno_Turma(codigo_turma_aluno);
CREATE INDEX idx_aluno_turma_mat ON Aluno_Turma(matricula_aluno);
CREATE INDEX idx_diario_turma ON Diario_Registro(codigo_turma);
