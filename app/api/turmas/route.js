import { NextResponse } from 'next/server';
import { listarTurmasPorDocente, isUsingVercelPostgres } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nif = searchParams.get('nif');

    if (!nif) {
      return NextResponse.json(
        { error: 'NIF do docente é obrigatório.' },
        { status: 400 }
      );
    }

    const turmas = await listarTurmasPorDocente(nif);

    return NextResponse.json({
      turmas,
      isVercelPostgres: isUsingVercelPostgres()
    });
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar turmas do docente.' },
      { status: 500 }
    );
  }
}
