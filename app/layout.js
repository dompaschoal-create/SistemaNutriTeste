import './globals.css';

export const metadata = {
  title: 'Diário Escolar Eletrônico | Gestão de Turmas e Notas',
  description: 'Sistema integrado de gestão escolar e diário de classe eletrônico conectado ao Vercel Postgres.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
