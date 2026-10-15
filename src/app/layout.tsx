import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RGR - Gerenciamento da Rotina do Dia a Dia | Facilities Ops',
  description: 'Playbook Operacional Vivo, Cadência e Agenda de Ritos com a Diretoria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
