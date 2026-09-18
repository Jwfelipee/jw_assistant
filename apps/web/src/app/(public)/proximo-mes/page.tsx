import type { Metadata } from "next";
import { PublicScheduleRoute } from "@/components/public-schedule-route";

export const metadata: Metadata = {
  title: "Próximo mês",
};

export default function ProximoMesPage() {
  return <PublicScheduleRoute slug="proximo-mes" />;
}
