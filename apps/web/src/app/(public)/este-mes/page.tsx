import type { Metadata } from "next";
import { PublicScheduleRoute } from "@/components/public-schedule-route";

export const metadata: Metadata = {
  title: "Este mês",
};

export default function EsteMesPage() {
  return <PublicScheduleRoute slug="este-mes" />;
}
