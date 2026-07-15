'use client';
import { Circle } from 'lucide-react';
import { AppLogo } from '@/shared/components/branding/app-logo.component';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { useShell } from '@/shared/hooks/shell.hook';
import Link from 'next/link';
import type { ComponentType } from 'react';

type SidebarIcon = ComponentType<{ className?: string }>;

export type SidebarMenuItem = {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon?: SidebarIcon;
  match?: 'exact' | 'prefix';
  excludeHrefs?: string[];
};

export type SidebarMenuSection = {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
};

export type SidebarMenuProps = {
  /** Item destacado acima das seções (opcional). */
  mainItem?: SidebarMenuItem;
  /** Seções de navegação renderizadas em uma única área. */
  sections: SidebarMenuSection[];
  /** Força o estado recolhido; por padrão segue o estado do shell. */
  collapsed?: boolean;
  /** Rota de destino ao clicar no logo. Default: '/'. */
  homeHref?: string;
};

const ITEM_BASE_CLASS =
  'group relative box-border flex h-11 w-full max-w-full items-center gap-3 rounded-xl px-3 text-[15px] text-zinc-300 transition-all duration-200 hover:bg-white/6 hover:text-zinc-100';
const COLLAPSED_CLASS = 'justify-center px-2';
const ACTIVE_CLASS =
  'border border-white/10 bg-linear-to-r from-white/10 via-white/6 to-zinc-800/70 text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';
const MENU_HEADER_HEIGHT_CLASS = 'h-16';

function joinClassNames(values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function isItemActive(pathname: string, item: SidebarMenuItem) {
  if (item.excludeHrefs?.some((excludedHref) => pathname === excludedHref || pathname.startsWith(`${excludedHref}/`))) {
    return false;
  }

  if (item.match === 'exact') {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarItemLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: SidebarMenuItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon ?? Circle;
  const link = (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={joinClassNames([ITEM_BASE_CLASS, collapsed && COLLAPSED_CLASS, active && ACTIVE_CLASS])}
    >
      <Icon className="size-4 shrink-0" />
      <span className={joinClassNames(['truncate', collapsed && 'sr-only'])}>{item.label}</span>
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

function MenuSections({
  sections,
  pathname,
  isCollapsed,
}: {
  sections: SidebarMenuSection[];
  pathname: string;
  isCollapsed: boolean;
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id}>
          {section.label && !isCollapsed ? (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              {section.label}
            </p>
          ) : null}

          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItemLink
                key={item.id}
                item={item}
                active={isItemActive(pathname, item)}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Menu de navegação lateral — área única.
 *
 * Toda a navegação é passada via `sections` (e opcionalmente `mainItem`) pelo
 * layout que renderiza este componente. Os caminhos de navegação fazem parte do
 * estado da aplicação e NÃO vivem aqui em shared/ — este componente é apenas a
 * apresentação. Para mudar o menu, edite as seções no layout de destino.
 */
export function SidebarMenu({ mainItem, sections, collapsed, homeHref = '/' }: SidebarMenuProps) {
  const pathname = usePathname();
  const { isMobile, isSidebarOpen } = useShell();
  const isCollapsed = collapsed ?? (!isMobile && !isSidebarOpen);

  return (
    <TooltipProvider>
      <nav className="flex min-h-full flex-col px-2 pb-4">
        <Link
          href={homeHref}
          aria-label="Ir para o início"
          className={joinClassNames([
            MENU_HEADER_HEIGHT_CLASS,
            'mb-3 flex shrink-0 items-center border-b border-white/8',
            isCollapsed ? 'justify-center px-0' : 'px-2',
          ])}
        >
          <AppLogo size="md" showText={!isCollapsed} priority />
        </Link>

        {mainItem ? (
          <>
            <div className="space-y-1">
              <SidebarItemLink item={mainItem} active={isItemActive(pathname, mainItem)} collapsed={isCollapsed} />
            </div>
            <div className="my-4 h-px bg-white/8" />
          </>
        ) : null}

        <MenuSections sections={sections} pathname={pathname} isCollapsed={isCollapsed} />
      </nav>
    </TooltipProvider>
  );
}
