import { Pool } from 'pg';

let pgPool = null;

// Memória fallback com os dados exatos do seed.sql para execução imediata sem erros
let inMemoryStore = {
  docentes: [
    { nif: 1001, nome: 'Prof. Carlos Eduardo Silva', senha: '123456' },
    { nif: 1002, nome: 'Profa. Mariana Costa Guimarães', senha: '123456' },
    { nif: 1003, nome: 'Prof. Roberto de Almeida Prado', senha: '123456' }
  ],
  alunos: [
    { matricula: 202401, nome: 'Ana Beatriz Ramos' },
    { matricula: 202402, nome: 'Lucas Fernandes Lima' },
    { matricula: 202403, nome: 'Juliana Martins Rocha' },
    { matricula: 202404, nome: 'Gabriel Souza Ribeiro' },
    { matricula: 202405, nome: 'Camila Nogueira Duarte' }
  ],
  turmas: [
    {
      codigo: 101,
      nome_curso: 'Desenvolvimento Web Fullstack',
      quantidade_maxima: 35,
      empresa: false,
      nome_empresa: null,
      turno: 'Noturno',
      data_ini: '2026-02-15',
      data_fim: '2026-06-30'
    },
    {
      codigo: 102,
      nome_curso: 'Banco de Dados e Análise de Dados',
      quantidade_maxima: 30,
      empresa: true,
      nome_empresa: 'Tech Soluções S.A.',
      turno: 'Vespertino',
      data_ini: '2026-03-01',
      data_fim: '2026-07-15'
    },
    {
      codigo: 103,
      nome_curso: 'Gestão e Segurança da Informação',
      quantidade_maxima: 25,
      empresa: false,
      nome_empresa: null,
      turno: 'Matutino',
      data_ini: '2026-02-20',
      data_fim: '2026-06-25'
    }
  ],
  professor_turma: [
    { id: 1, codigo_turma: 101, nif_docente: 1001, status_diario: 'Em dia' },
    { id: 2, codigo_turma: 102, nif_docente: 1001, status_diario: 'Pendente' },
    { id: 3, codigo_turma: 102, nif_docente: 1002, status_diario: 'Em dia' },
    { id: 4, codigo_turma: 103, nif_docente: 1003, status_diario: 'Em dia' }
  ],
  aluno_turma: [
    { id: 1, codigo_turma_aluno: 101, matricula_aluno: 202401, status_final: 'Matriculado', nota: 9.50, faltas: 1, presenca_percentual: 95.00 },
    { id: 2, codigo_turma_aluno: 101, matricula_aluno: 202402, status_final: 'Matriculado', nota: 8.00, faltas: 2, presenca_percentual: 90.00 },
    { id: 3, codigo_turma_aluno: 101, matricula_aluno: 202403, status_final: 'Matriculado', nota: 6.50, faltas: 4, presenca_percentual: 80.00 },
    { id: 4, codigo_turma_aluno: 102, matricula_aluno: 202403, status_final: 'Matriculado', nota: 8.50, faltas: 0, presenca_percentual: 100.00 },
    { id: 5, codigo_turma_aluno: 102, matricula_aluno: 202404, status_final: 'Matriculado', nota: 7.00, faltas: 1, presenca_percentual: 95.00 },
    { id: 6, codigo_turma_aluno: 103, matricula_aluno: 202405, status_final: 'Matriculado', nota: 10.00, faltas: 0, presenca_percentual: 100.00 }
  ],
  diario_registros: []
};

export function getDbConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
}

export function isUsingVercelPostgres() {
  return Boolean(getDbConnectionString());
}

export function getPool() {
  const connectionString = getDbConnectionString();
  if (!connectionString) {
    return null;
  }
  if (!pgPool) {
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

// Executa query no Vercel Postgres se disponível
export async function query(text, params = []) {
  const pool = getPool();
  if (pool) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }
  return null;
}

// Inicializa o banco no Vercel Postgres caso as tabelas ainda não existam
export async function initializeDatabaseSchema() {
  const pool = getPool();
  if (!pool) {
    return { success: false, message: 'Nenhuma string de conexão POSTGRES_URL configurada.' };
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Docente (
        nif INT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        senha VARCHAR(255) NOT NULL DEFAULT '123456'
      );

      CREATE TABLE IF NOT EXISTS Aluno (
        matricula INT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Turma (
        codigo INT PRIMARY KEY,
        nome_curso VARCHAR(150) NOT NULL,
        quantidade_maxima INT NOT NULL CHECK (quantidade_maxima > 0),
        empresa BOOLEAN NOT NULL DEFAULT FALSE,
        nome_empresa VARCHAR(150) NULL,
        turno VARCHAR(30) NOT NULL,
        data_ini DATE NOT NULL,
        data_fim DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Professor_Turma (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        codigo_turma INT NOT NULL,
        nif_docente INT NOT NULL,
        status_diario VARCHAR(50) NOT NULL DEFAULT 'Pendente',
        CONSTRAINT fk_pt_turma FOREIGN KEY (codigo_turma) REFERENCES Turma (codigo) ON DELETE CASCADE,
        CONSTRAINT fk_pt_docente FOREIGN KEY (nif_docente) REFERENCES Docente (nif) ON DELETE CASCADE,
        CONSTRAINT uq_turma_docente_pg UNIQUE (codigo_turma, nif_docente)
      );

      CREATE TABLE IF NOT EXISTS Aluno_Turma (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        codigo_turma_aluno INT NOT NULL,
        matricula_aluno INT NOT NULL,
        status_final VARCHAR(50) NOT NULL DEFAULT 'Matriculado',
        nota NUMERIC(4,2) DEFAULT NULL,
        faltas INT NOT NULL DEFAULT 0,
        presenca_percentual NUMERIC(5,2) DEFAULT 100.00,
        CONSTRAINT fk_at_turma FOREIGN KEY (codigo_turma_aluno) REFERENCES Turma (codigo) ON DELETE CASCADE,
        CONSTRAINT fk_at_aluno FOREIGN KEY (matricula_aluno) REFERENCES Aluno (matricula) ON DELETE CASCADE,
        CONSTRAINT uq_turma_aluno_pg UNIQUE (codigo_turma_aluno, matricula_aluno)
      );
    `);

    // Inserção idempotente dos dados iniciais caso tabelas estejam vazias
    const docCheck = await client.query('SELECT COUNT(*) FROM Docente');
    if (parseInt(docCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO Docente (nif, nome, senha) VALUES
        (1001, 'Prof. Carlos Eduardo Silva', '123456'),
        (1002, 'Profa. Mariana Costa Guimarães', '123456'),
        (1003, 'Prof. Roberto de Almeida Prado', '123456');

        INSERT INTO Aluno (matricula, nome) VALUES
        (202401, 'Ana Beatriz Ramos'),
        (202402, 'Lucas Fernandes Lima'),
        (202403, 'Juliana Martins Rocha'),
        (202404, 'Gabriel Souza Ribeiro'),
        (202405, 'Camila Nogueira Duarte');

        INSERT INTO Turma (codigo, nome_curso, quantidade_maxima, empresa, nome_empresa, turno, data_ini, data_fim) VALUES
        (101, 'Desenvolvimento Web Fullstack', 35, FALSE, NULL, 'Noturno', '2026-02-15', '2026-06-30'),
        (102, 'Banco de Dados e Análise de Dados', 30, TRUE, 'Tech Soluções S.A.', 'Vespertino', '2026-03-01', '2026-07-15'),
        (103, 'Gestão e Segurança da Informação', 25, FALSE, NULL, 'Matutino', '2026-02-20', '2026-06-25');

        INSERT INTO Professor_Turma (codigo_turma, nif_docente, status_diario) VALUES
        (101, 1001, 'Em dia'),
        (102, 1001, 'Pendente'),
        (102, 1002, 'Em dia'),
        (103, 1003, 'Em dia');

        INSERT INTO Aluno_Turma (codigo_turma_aluno, matricula_aluno, status_final, nota, faltas, presenca_percentual) VALUES
        (101, 202401, 'Matriculado', 9.50, 1, 95.00),
        (101, 202402, 'Matriculado', 8.00, 2, 90.00),
        (101, 202403, 'Matriculado', 6.50, 4, 80.00),
        (102, 202403, 'Matriculado', 8.50, 0, 100.00),
        (102, 202404, 'Matriculado', 7.00, 1, 95.00),
        (103, 202405, 'Matriculado', 10.00, 0, 100.00);
      `);
    }

    return { success: true, message: 'Banco Vercel Postgres inicializado com sucesso!' };
  } catch (err) {
    console.error('Erro ao inicializar Vercel Postgres:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

// ==============================================================================
// MÉTODOS DE ACESSO A DADOS (CAMADA REPOSITÓRIO)
// ==============================================================================

export async function autenticarDocente(nif, senha) {
  const nifInt = parseInt(nif, 10);
  if (isNaN(nifInt)) return null;

  if (isUsingVercelPostgres()) {
    try {
      const res = await query(
        'SELECT nif, nome FROM Docente WHERE nif = $1 AND senha = $2',
        [nifInt, String(senha)]
      );
      if (res && res.rows.length > 0) {
        return res.rows[0];
      }
      return null;
    } catch (err) {
      console.warn('Falha na query PG, recorrendo à memória:', err.message);
    }
  }

  // Fallback em memória
  const docente = inMemoryStore.docentes.find(
    (d) => d.nif === nifInt && String(d.senha) === String(senha)
  );
  if (docente) {
    return { nif: docente.nif, nome: docente.nome };
  }
  return null;
}

export async function listarTurmasPorDocente(nif) {
  const nifInt = parseInt(nif, 10);

  if (isUsingVercelPostgres()) {
    try {
      const res = await query(
        `SELECT 
          t.codigo,
          t.nome_curso,
          t.quantidade_maxima,
          t.empresa,
          t.nome_empresa,
          t.turno,
          TO_CHAR(t.data_ini, 'YYYY-MM-DD') AS data_ini,
          TO_CHAR(t.data_fim, 'YYYY-MM-DD') AS data_fim,
          pt.status_diario,
          COUNT(at.id)::int AS total_alunos
        FROM Professor_Turma pt
        INNER JOIN Turma t ON t.codigo = pt.codigo_turma
        LEFT JOIN Aluno_Turma at ON at.codigo_turma_aluno = t.codigo
        WHERE pt.nif_docente = $1
        GROUP BY t.codigo, t.nome_curso, t.quantidade_maxima, t.empresa, t.nome_empresa, t.turno, t.data_ini, t.data_fim, pt.status_diario
        ORDER BY t.codigo ASC`,
        [nifInt]
      );
      if (res) return res.rows;
    } catch (err) {
      console.warn('Falha na query PG turmas, recorrendo à memória:', err.message);
    }
  }

  // Fallback em memória
  const turmasDocente = inMemoryStore.professor_turma.filter((pt) => pt.nif_docente === nifInt);
  return turmasDocente.map((pt) => {
    const turma = inMemoryStore.turmas.find((t) => t.codigo === pt.codigo_turma);
    const alunos = inMemoryStore.aluno_turma.filter((at) => at.codigo_turma_aluno === pt.codigo_turma);
    return {
      ...turma,
      status_diario: pt.status_diario,
      total_alunos: alunos.length
    };
  });
}

export async function obterDetalhesTurma(codigo, nif) {
  const codInt = parseInt(codigo, 10);
  const nifInt = parseInt(nif, 10);

  if (isUsingVercelPostgres()) {
    try {
      const turmaRes = await query(
        `SELECT 
          t.codigo,
          t.nome_curso,
          t.quantidade_maxima,
          t.empresa,
          t.nome_empresa,
          t.turno,
          TO_CHAR(t.data_ini, 'YYYY-MM-DD') AS data_ini,
          TO_CHAR(t.data_fim, 'YYYY-MM-DD') AS data_fim,
          pt.status_diario
        FROM Professor_Turma pt
        INNER JOIN Turma t ON t.codigo = pt.codigo_turma
        WHERE t.codigo = $1 AND pt.nif_docente = $2`,
        [codInt, nifInt]
      );

      if (turmaRes && turmaRes.rows.length > 0) {
        const alunosRes = await query(
          `SELECT 
            at.id AS id_matricula,
            a.matricula,
            a.nome,
            at.nota,
            at.faltas,
            at.presenca_percentual,
            at.status_final
          FROM Aluno_Turma at
          INNER JOIN Aluno a ON a.matricula = at.matricula_aluno
          WHERE at.codigo_turma_aluno = $1
          ORDER BY a.nome ASC`,
          [codInt]
        );
        return {
          turma: turmaRes.rows[0],
          alunos: alunosRes ? alunosRes.rows : []
        };
      }
    } catch (err) {
      console.warn('Falha na query PG detalhes turma, recorrendo à memória:', err.message);
    }
  }

  // Fallback em memória
  const vinculo = inMemoryStore.professor_turma.find(
    (pt) => pt.codigo_turma === codInt && pt.nif_docente === nifInt
  );
  if (!vinculo) return null;

  const turma = inMemoryStore.turmas.find((t) => t.codigo === codInt);
  const alunoTurmas = inMemoryStore.aluno_turma.filter((at) => at.codigo_turma_aluno === codInt);
  const alunos = alunoTurmas.map((at) => {
    const aluno = inMemoryStore.alunos.find((a) => a.matricula === at.matricula_aluno);
    return {
      id_matricula: at.id,
      matricula: aluno.matricula,
      nome: aluno.nome,
      nota: at.nota,
      faltas: at.faltas,
      presenca_percentual: at.presenca_percentual,
      status_final: at.status_final
    };
  });

  return {
    turma: { ...turma, status_diario: vinculo.status_diario },
    alunos
  };
}

export async function salvarLancamentoNotasPresencas(codigoTurma, nifDocente, alunosAtualizados) {
  const codInt = parseInt(codigoTurma, 10);
  const nifInt = parseInt(nifDocente, 10);

  if (isUsingVercelPostgres()) {
    try {
      for (const al of alunosAtualizados) {
        const notaVal = al.nota !== '' && al.nota !== null ? parseFloat(al.nota) : null;
        const faltasVal = parseInt(al.faltas || 0, 10);
        const presencaVal = parseFloat(al.presenca_percentual || 100);

        await query(
          `UPDATE Aluno_Turma
           SET nota = $1, faltas = $2, presenca_percentual = $3, status_final = $4
           WHERE codigo_turma_aluno = $5 AND matricula_aluno = $6`,
          [notaVal, faltasVal, presencaVal, al.status_final || 'Matriculado', codInt, parseInt(al.matricula, 10)]
        );
      }

      // Atualiza o diário do docente para 'Em dia'
      await query(
        `UPDATE Professor_Turma
         SET status_diario = 'Em dia'
         WHERE codigo_turma = $1 AND nif_docente = $2`,
        [codInt, nifInt]
      );

      return { success: true };
    } catch (err) {
      console.warn('Falha no update PG, atualizando memória:', err.message);
    }
  }

  // Fallback em memória
  for (const al of alunosAtualizados) {
    const matriculaInt = parseInt(al.matricula, 10);
    const item = inMemoryStore.aluno_turma.find(
      (at) => at.codigo_turma_aluno === codInt && at.matricula_aluno === matriculaInt
    );
    if (item) {
      item.nota = al.nota !== '' && al.nota !== null ? parseFloat(al.nota) : null;
      item.faltas = parseInt(al.faltas || 0, 10);
      item.presenca_percentual = parseFloat(al.presenca_percentual || 100);
      item.status_final = al.status_final || 'Matriculado';
    }
  }

  const vinculo = inMemoryStore.professor_turma.find(
    (pt) => pt.codigo_turma === codInt && pt.nif_docente === nifInt
  );
  if (vinculo) {
    vinculo.status_diario = 'Em dia';
  }

  return { success: true };
}
