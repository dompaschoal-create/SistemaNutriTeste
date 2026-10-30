import { NextResponse } from 'next/server';
import { isUsingVercelPostgres, initializeDatabaseSchema } from '@/lib/db';

export async function GET() {
  const isPostgres = isUsingVercelPostgres();
  return NextResponse.json({
    isVercelPostgres: isPostgres,
    statusText: isPostgres
      ? 'Conectado diretamente ao Vercel Postgres (Neon)'
      : 'Modo Demonstração Integrado (Adicione a variável POSTGRES_URL na Vercel para persistência em nuvem)'
  });
}

export async function POST() {
  try {
    const res = await initializeDatabaseSchema();
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
