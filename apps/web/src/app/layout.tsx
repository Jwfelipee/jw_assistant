import type { Metadata, Viewport } from "next";
import { Literata, Manrope } from "next/font/google";
import "./globals.css";

const brand = Literata({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
});

const ui = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const APP_NAME = "Assistente S-140";
const APP_DESCRIPTION =
  "Programação da reunião do meio de semana — designações S-140";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2f6b62",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${brand.variable} ${ui.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
