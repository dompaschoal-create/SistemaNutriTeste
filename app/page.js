'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  LogOut, 
  Database,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function DiarioEscolarApp() {
  const [docente, setDocente] = useState(null);
  const [loginNif, setLoginNif] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [loadingTurma, setLoadingTurma] = useState(false);
  const [salvandoDiario, setSalvandoDiario] = useState(false);

  const [dbStatus, setDbStatus] = useState({ isVercelPostgres: false, statusText: 'Verificando banco...' });
  const [toastMsg, setToastMsg] = useState('');
  const [conteudoAula, setConteudoAula] = useState('');

  // Carrega sessão salva no navegador se houver
  useEffect(() => {
    const saved = localStorage.getItem('diario_docente_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDocente(parsed);
      } catch (e) {
        localStorage.removeItem('diario_docente_session');
      }
    }
    checarStatusBanco();
  }, []);

  // Quando o docente estiver logado, busca as turmas
  useEffect(() => {
    if (docente?.nif) {
      carregarTurmas(docente.nif);
    }
  }, [docente]);

  async function checarStatusBanco() {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      console.warn('Erro ao checar status do banco:', err);
    }
  }

  function mostrarToast(mensagem) {
    setToastMsg(mensagem);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoginErro('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nif: loginNif, senha: loginSenha })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginErro(data.error || 'Credenciais inválidas.');
        setLoginLoading(false);
        return;
      }

      setDocente(data.docente);
      localStorage.setItem('diario_docente_session', JSON.stringify(data.docente));
      mostrarToast(`Bem-vindo, ${data.docente.nome}!`);
    } catch (err) {
      setLoginErro('Falha ao conectar com o servidor.');
    } finally {
      setLoginLoading(false);
    }
  }

  function preencherLoginRapido(nif, senha) {
    setLoginNif(String(nif));
    setLoginSenha(String(senha));
  }

  function handleLogout() {
    localStorage.removeItem('diario_docente_session');
    setDocente(null);
    setTurmas([]);
    setTurmaSelecionada(null);
    setAlunosTurma([]);
  }

  async function carregarTurmas(nif) {
    try {
      const res = await fetch(`/api/turmas?nif=${nif}`);
      const data = await res.json();
      if (res.ok) {
        setTurmas(data.turmas || []);
      }
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
    }
  }

  async function abrirTurma(codigo) {
    setLoadingTurma(true);
    try {
      const res = await fetch(`/api/turmas/${codigo}?nif=${docente.nif}`);
      const data = await res.json();
      if (res.ok) {
        setTurmaSelecionada(data.turma);
        setAlunosTurma(data.alunos || []);
      } else {
        mostrarToast(data.error || 'Não foi possível carregar a turma.');
      }
    } catch (err) {
      console.error('Erro ao abrir turma:', err);
    } finally {
      setLoadingTurma(false);
    }
  }

  function atualizarNotaAluno(index, valor) {
    const novos = [...alunosTurma];
    novos[index].nota = valor;
    // Auto status
    const num = parseFloat(valor);
    if (!isNaN(num)) {
      if (num >= 7.0) {
        novos[index].status_final = 'Aprovado';
      } else if (num < 5.0) {
        novos[index].status_final = 'Reprovado';
      } else {
        novos[index].status_final = 'Matriculado';
      }
    }
    setAlunosTurma(novos);
  }

  function alterarFaltas(index, delta) {
    const novos = [...alunosTurma];
    let atual = parseInt(novos[index].faltas || 0, 10);
    atual = Math.max(0, atual + delta);
    novos[index].faltas = atual;

    // Cálculo aproximado de presença (ex: 20 aulas no mês)
    const baseAulas = 20;
    const perc = Math.max(0, Math.min(100, Math.round(((baseAulas - atual) / baseAulas) * 100)));
    novos[index].presenca_percentual = perc;

    if (perc < 75) {
      novos[index].status_final = 'Reprovado por Faltas';
    }
    setAlunosTurma(novos);
  }

  function alterarStatusAluno(index, status) {
    const novos = [...alunosTurma];
    novos[index].status_final = status;
    setAlunosTurma(novos);
  }

  async function salvarDiario() {
    setSalvandoDiario(true);
    try {
      const res = await fetch(`/api/turmas/${turmaSelecionada.codigo}/lancar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nif: docente.nif,
          alunos: alunosTurma
        })
      });

      const data = await res.json();
      if (res.ok) {
        mostrarToast('✅ Notas e presenças salvas no banco com sucesso!');
        setTurmaSelecionada((prev) => ({ ...prev, status_diario: 'Em dia' }));
        // Recarrega as turmas para atualizar a tag de diário
        carregarTurmas(docente.nif);
      } else {
        mostrarToast(data.error || 'Erro ao salvar alterações.');
      }
    } catch (err) {
      mostrarToast('Falha na comunicação com o banco.');
    } finally {
      setSalvandoDiario(false);
    }
  }

  // ==============================================================================
  // TELA 1: LOGIN DO DOCENTE
  // ==============================================================================
  if (!docente) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-box">
              <GraduationCap size={32} />
            </div>
            <h1 className="login-title">Diário Escolar</h1>
            <p className="login-subtitle">Acesso exclusivo para Docentes</p>
          </div>

          {loginErro && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{loginErro}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">NIF do Docente (Identificador Inteiro)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 1001"
                value={loginNif}
                onChange={(e) => setLoginNif(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha de Acesso</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              disabled={loginLoading}
            >
              {loginLoading ? 'Validando...' : 'Acessar Diário Eletrônico'}
            </button>
          </form>

          {/* Atalhos de Login Rápido para Demonstração */}
          <div className="quick-logins">
            <div className="quick-title">Credenciais de Teste (1-Clique)</div>
            <div className="quick-btn-grid">
              <button
                type="button"
                className="quick-btn"
                onClick={() => preencherLoginRapido(1001, '123456')}
              >
                <span><strong>Prof. Carlos Eduardo</strong> (NIF: 1001)</span>
                <span>Preencher</span>
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => preencherLoginRapido(1002, '123456')}
              >
                <span><strong>Profa. Mariana Costa</strong> (NIF: 1002)</span>
                <span>Preencher</span>
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => preencherLoginRapido(1003, '123456')}
              >
                <span><strong>Prof. Roberto Almeida</strong> (NIF: 1003)</span>
                <span>Preencher</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            Banco de Dados Relacional Vercel Postgres / Neon
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // TELA 2 & 3: PAINEL DO DOCENTE (DASHBOARD OU DETALHES DA TURMA)
  // ==============================================================================
  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-notification">
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="brand-title">Diário Escolar Eletrônico</div>
            <div className="brand-subtitle">Gestão Acadêmica de Turmas e Notas</div>
          </div>
        </div>

        <div className="user-nav">
          <div className="user-badge">
            <span className="user-nif">NIF: {docente.nif}</span>
            <span className="user-name">{docente.nome}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sair do sistema">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Status da Conexão com o Banco Vercel Postgres */}
      <div className="db-status-bar">
        <div className="db-indicator">
          <span className="pulse-dot"></span>
          <Database size={16} style={{ color: '#10b981' }} />
          <span>{dbStatus.statusText}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Identificadores inteiros (NIF, Matrícula, Código Turma, ID)
        </span>
      </div>

      {/* RENDERIZAÇÃO: SELECIONOU UMA TURMA (DIÁRIO DE CLASSE) */}
      {turmaSelecionada ? (
        <div>
          <div className="diary-header">
            <button
              onClick={() => setTurmaSelecionada(null)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Voltar para Minhas Turmas</span>
            </button>

            <button
              onClick={salvarDiario}
              disabled={salvandoDiario}
              className="btn btn-primary"
            >
              <Save size={18} />
              <span>{salvandoDiario ? 'Salvando no Banco...' : 'Salvar Alterações do Diário'}</span>
            </button>
          </div>

          {/* Banner da Turma */}
          <div className="diary-banner">
            <div className="diary-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="turma-badge-code">Turma #{turmaSelecionada.codigo}</span>
                <span className={`badge-status ${turmaSelecionada.status_diario === 'Em dia' ? 'em-dia' : 'pendente'}`}>
                  {turmaSelecionada.status_diario === 'Em dia' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  Diário {turmaSelecionada.status_diario}
                </span>
                {turmaSelecionada.empresa && (
                  <span className="turma-empresa-tag">
                    <Building2 size={12} />
                    {turmaSelecionada.nome_empresa || 'Corporativa'}
                  </span>
                )}
              </div>
              <h2>{turmaSelecionada.nome_curso}</h2>
              <div className="diary-meta-pills">
                <span className="meta-pill">Turno: {turmaSelecionada.turno}</span>
                <span className="meta-pill">Período: {turmaSelecionada.data_ini} até {turmaSelecionada.data_fim}</span>
                <span className="meta-pill">Capacidade: {alunosTurma.length} / {turmaSelecionada.quantidade_maxima} alunos</span>
              </div>
            </div>

            {/* Resumo Rápido */}
            <div style={{
              display: 'flex',
              gap: '16px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Média da Turma</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                  {alunosTurma.length > 0
                    ? (
                        alunosTurma.reduce((acc, a) => acc + (parseFloat(a.nota) || 0), 0) /
                        alunosTurma.filter((a) => a.nota !== null && a.nota !== '').length || 0
                      ).toFixed(1)
                    : '0.0'}
                </div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total de Alunos</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>
                  {alunosTurma.length}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Lançamento de Notas e Presenças */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#10b981' }} />
                <span>Lista de Alunos Matriculados (Relacionamento Aluno_Turma)</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Altere as notas e faltas e clique em "Salvar Alterações"
              </span>
            </div>

            <div className="table-responsive">
              <table className="diary-table">
                <thead>
                  <tr>
                    <th>Matrícula (ID)</th>
                    <th>Nome do Aluno</th>
                    <th>Nota (0.0 a 10.0)</th>
                    <th>Faltas</th>
                    <th>Frequência</th>
                    <th>Situação Final</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosTurma.map((aluno, index) => {
                    const notaNum = parseFloat(aluno.nota);
                    const gradeClass = !isNaN(notaNum)
                      ? notaNum >= 7.0
                        ? 'grade-high'
                        : notaNum < 5.0
                        ? 'grade-low'
                        : ''
                      : '';

                    return (
                      <tr key={aluno.matricula}>
                        <td className="student-mat">{aluno.matricula}</td>
                        <td className="student-name">{aluno.nome}</td>
                        <td>
                          <div className="grade-input-wrapper">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              className={`grade-input ${gradeClass}`}
                              value={aluno.nota !== null ? aluno.nota : ''}
                              placeholder="-"
                              onChange={(e) => atualizarNotaAluno(index, e.target.value)}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>pts</span>
                          </div>
                        </td>
                        <td>
                          <div className="attendance-control">
                            <button
                              type="button"
                              className="btn-counter"
                              onClick={() => alterarFaltas(index, -1)}
                              title="Diminuir falta"
                            >
                              -
                            </button>
                            <span className="counter-value">{aluno.faltas || 0}</span>
                            <button
                              type="button"
                              className="btn-counter"
                              onClick={() => alterarFaltas(index, 1)}
                              title="Adicionar falta"
                            >
                              +
                            </button>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>aulas</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '45px',
                              height: '6px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${aluno.presenca_percentual || 100}%`,
                                height: '100%',
                                background: (aluno.presenca_percentual || 100) >= 75 ? '#10b981' : '#ef4444'
                              }}></div>
                            </div>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: (aluno.presenca_percentual || 100) >= 75 ? '#34d399' : '#f87171'
                            }}>
                              {aluno.presenca_percentual || 100}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={aluno.status_final || 'Matriculado'}
                            onChange={(e) => alterarStatusAluno(index, e.target.value)}
                          >
                            <option value="Matriculado">Matriculado</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Reprovado">Reprovado</option>
                            <option value="Reprovado por Faltas">Reprovado por Faltas</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '16px 20px', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setTurmaSelecionada(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarDiario}
                disabled={salvandoDiario}
                className="btn btn-primary"
              >
                <Save size={18} />
                <span>{salvandoDiario ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* RENDERIZAÇÃO: DASHBOARD DE TURMAS DO DOCENTE */
        <div>
          <div className="dashboard-header">
            <h2 className="greeting-title">Minhas Turmas Atribuídas</h2>
            <p className="greeting-subtitle">
              Selecione uma turma para acessar a lista de alunos, registrar frequências e lançar notas.
            </p>
          </div>

          {/* Cards de Resumo */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div className="stat-value">{turmas.length}</div>
                <div className="stat-label">Turmas Atribuídas</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {turmas.reduce((acc, t) => acc + (t.total_alunos || 0), 0)}
                </div>
                <div className="stat-label">Total de Alunos Matriculados</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {turmas.filter((t) => t.status_diario === 'Pendente').length}
                </div>
                <div className="stat-label">Diários com Lançamento Pendente</div>
              </div>
            </div>
          </div>

          {/* Grid de Turmas */}
          <div className="turmas-grid">
            {turmas.map((turma) => (
              <div key={turma.codigo} className="turma-card">
                <div>
                  <div className="turma-top">
                    <span className="turma-badge-code">Código #{turma.codigo}</span>
                    <span className={`badge-status ${turma.status_diario === 'Em dia' ? 'em-dia' : 'pendente'}`}>
                      {turma.status_diario === 'Em dia' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {turma.status_diario}
                    </span>
                  </div>

                  <h3 className="turma-title">{turma.nome_curso}</h3>

                  <div className="turma-meta-list">
                    <div className="turma-meta-item">
                      <Clock size={16} />
                      <span>Turno: <strong>{turma.turno}</strong></span>
                    </div>

                    <div className="turma-meta-item">
                      <Calendar size={16} />
                      <span>{turma.data_ini} até {turma.data_fim}</span>
                    </div>

                    <div className="turma-meta-item">
                      <Users size={16} />
                      <span>{turma.total_alunos || 0} alunos de {turma.quantidade_maxima} vagas</span>
                    </div>

                    {turma.empresa && (
                      <div className="turma-empresa-tag" style={{ marginTop: '4px' }}>
                        <Building2 size={14} />
                        <span>Empresa: {turma.nome_empresa || 'Parceira'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => abrirTurma(turma.codigo)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  <UserCheck size={16} />
                  <span>Acessar Diário de Classe</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
