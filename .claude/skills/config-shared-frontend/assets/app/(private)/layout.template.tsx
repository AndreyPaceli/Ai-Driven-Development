'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { ShellProvider } from '@/shared/context/shell.context';
import { AdminShell } from '@/shared/template/admin-shell.component';
import { SidebarMenu, type SidebarMenuSection } from '@/shared/components/ui/sidebar-menu.component';

/**
 * Navegação da aplicação.
 *
 * Os caminhos de navegação fazem parte do ESTADO da aplicação e por isso são
 * definidos aqui no layout — não em shared/. Para alterar o menu (adicionar
 * itens, seções ou reorganizar a estrutura), edite NAVIGATION_SECTIONS abaixo.
 * Cada `href` deve apontar para uma rota dentro do grupo (private).
 */
const NAVIGATION_SECTIONS: SidebarMenuSection[] = [
  {
    id: 'main',
    label: 'Navegação',
    items: [{ id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, match: 'prefix' }],
  },
];

const HOME_ROUTE = '/dashboard';
const LANDING_ROUTE = '/';

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ShellProvider defaultOpen>
      <AdminShell
        sidebar={<SidebarMenu sections={NAVIGATION_SECTIONS} homeHref={HOME_ROUTE} />}
        logoHref={HOME_ROUTE}
        onLogout={() => router.push(LANDING_ROUTE)}
      >
        {children}
      </AdminShell>
    </ShellProvider>
  );
}
