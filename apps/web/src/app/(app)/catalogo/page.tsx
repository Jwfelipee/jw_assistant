import type { Metadata } from "next";
import { CatalogClient } from "./catalog-client";
import { pageMainClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Catálogo FSM",
  description:
    "Gerenciar tipos de parte de Faça Seu Melhor no Ministério",
};

export default function CatalogoPage() {
  return (
    <main className={pageMainClass}>
      <CatalogClient />
    </main>
  );
}
