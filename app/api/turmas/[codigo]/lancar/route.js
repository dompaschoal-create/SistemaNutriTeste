import { NextResponse } from 'next/server';
import { salvarLancamentoNotasPresencas, isUsingVercelPostgres } from '@/lib/db';

export async function POST(request, context) {
  try {
    const { params } = context;
    const { codigo } = await params;
    const body = await request.json();
    const { nif, alunos } = body;

    if (!codigo || !nif || !Array.isArray(alunos)) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos para lançamento do diário.' },
        { status: 400 }
      );
    }

    const resultado = await salvarLancamentoNotasPresencas(codigo, nif, alunos);

    return NextResponse.json({
      success: true,
      message: 'Notas e presenças registradas com sucesso no diário!',
      isVercelPostgres: isUsingVercelPostgres(),
      resultado
    });
  } catch (error) {
    console.error('Erro ao salvar diário:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar notas e presenças.' },
      { status: 500 }
    );
  }
}
