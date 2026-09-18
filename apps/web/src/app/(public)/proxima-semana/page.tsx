import type { Metadata } from "next";
import { PublicScheduleRoute } from "@/components/public-schedule-route";

export const metadata: Metadata = {
  title: "Próxima semana",
};

export default function ProximaSemanaPage() {
  return <PublicScheduleRoute slug="proxima-semana" />;
}
