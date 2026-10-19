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
      <body className="bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-atlas-600 selection:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
