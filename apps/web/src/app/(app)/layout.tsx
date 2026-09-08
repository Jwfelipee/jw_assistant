import { BottomNav } from "@/components/bottom-nav";

/**
 * Shell autenticado: conteúdo branco sobre fundo da plataforma + bottom nav.
 */
export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-dvh bg-[var(--paper)]">
      <div
        className="app-content-shell mx-auto w-full max-w-[var(--shell-max)]"
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
