import { NextResponse } from 'next/server';
import { obterDetalhesTurma, isUsingVercelPostgres } from '@/lib/db';

export async function GET(request, context) {
  try {
    const { params } = context;
    const { codigo } = await params;
    const { searchParams } = new URL(request.url);
    const nif = searchParams.get('nif');

    if (!codigo || !nif) {
      return NextResponse.json(
        { error: 'Código da turma e NIF do docente são obrigatórios.' },
        { status: 400 }
      );
    }

    const dados = await obterDetalhesTurma(codigo, nif);

    if (!dados) {
      return NextResponse.json(
        { error: 'Turma não encontrada ou você não possui permissão para acessá-la.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...dados,
      isVercelPostgres: isUsingVercelPostgres()
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da turma:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar detalhes da turma.' },
      { status: 500 }
    );
  }
}
