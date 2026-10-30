import { NextResponse } from 'next/server';
import { autenticarDocente, isUsingVercelPostgres } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nif, senha } = body;

    if (!nif || !senha) {
      return NextResponse.json(
        { error: 'Por favor, informe o NIF e a senha.' },
        { status: 400 }
      );
    }

    const docente = await autenticarDocente(nif, senha);

    if (!docente) {
      return NextResponse.json(
        { error: 'NIF ou senha incorretos. Verifique suas credenciais.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      docente,
      isVercelPostgres: isUsingVercelPostgres()
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar autenticação.' },
      { status: 500 }
    );
  }
}
