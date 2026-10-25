import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RGR • Gerenciamento da Rotina & Governança Executiva',
  description: 'Sistema Integrado de Governança, Ritos Operacionais, POPs e Despacho de Diretoria para Empresas de Facilities.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg'
  },
  themeColor: '#0ea879'
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
