import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-[var(--paper)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--shell-max)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        {children}
      </div>
    </div>
  );
}
