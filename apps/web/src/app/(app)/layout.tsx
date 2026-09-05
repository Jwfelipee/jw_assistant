import { BottomNav } from "@/components/bottom-nav";

/**
 * Shell autenticado: conteúdo com max-width confortável + espaço para bottom nav
 * (safe-area iOS). Login fica fora deste grupo de rotas.
 */
export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-dvh">
      <div
        className="mx-auto w-full max-w-[var(--shell-max)]"
        style={{
          paddingBottom:
            "calc(var(--nav-clearance) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
