import type { Metadata } from "next";
import { PublicScheduleRoute } from "@/components/public-schedule-route";

export const metadata: Metadata = {
  title: "Esta semana",
};

export default function EstaSemanaPage() {
  return <PublicScheduleRoute slug="esta-semana" />;
}
