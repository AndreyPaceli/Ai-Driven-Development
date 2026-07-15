import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AppLogo } from '@/shared/components/branding/app-logo.component';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

/**
 * Tela de autenticação de exemplo (rota `/join`).
 *
 * Ainda sem formulário — apenas o esqueleto da tela com os caminhos de
 * navegação: voltar para a landing page e seguir para o dashboard.
 * Substitua o conteúdo pelo formulário real de login quando definido.
 */
export default function AuthPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_45%)]" />

      <Card className="relative w-full max-w-md border-white/10 bg-zinc-950/80 p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <AppLogo size="lg" priority />

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Autenticação</h1>
            <p className="text-sm text-muted-foreground">Formulário de login em desenvolvimento.</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Ir para o dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
