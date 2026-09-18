"use client";

import { useState } from "react";
import { PublicScheduleListView } from "@/components/public-schedule-list-view";
import { PublicSchedulePrintView } from "@/components/public-schedule-print-view";
import type { PublicScheduleView } from "@/lib/public-schedule";

type PublicScheduleContentProps = {
  view: PublicScheduleView;
};

export function PublicScheduleContent({ view }: PublicScheduleContentProps) {
  const [mode, setMode] = useState<"list" | "print">("list");

  if (mode === "print") {
    return (
      <PublicSchedulePrintView view={view} onBack={() => setMode("list")} />
    );
  }

  return (
    <PublicScheduleListView view={view} onPrintMode={() => setMode("print")} />
  );
}
