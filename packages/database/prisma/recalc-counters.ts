/**
 * Idempotent historical counter recalculation (design D3).
 *
 * Zeros all assignment counters, then rebuilds from AssignmentSlot history.
 * Safe to run multiple times — second run produces identical counts.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  AssignmentRole,
  PartTopic,
  Sex,
} from "@jw/shared";
import {
  counterFieldForCategory,
  resolveCountCategories,
  type CountCategoryField,
} from "../../../apps/api/src/schedule/assign-rules";

loadEnv({ path: resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();

type CounterTotals = Record<CountCategoryField, number>;

function emptyCounters(): CounterTotals {
  return {
    presidenteCount: 0,
    oracaoCount: 0,
    titularCount: 0,
    dirigenteCount: 0,
    ajudanteCount: 0,
    ministerioCount: 0,
  };
}

export async function recalcCounters(): Promise<void> {
  await prisma.participant.updateMany({
    data: {
      titularCount: 0,
      ajudanteCount: 0,
      dirigenteCount: 0,
      leitorCount: 0,
      ministryPracticeCount: 0,
      presidenteCount: 0,
      oracaoCount: 0,
      ministerioCount: 0,
    },
  });

  const slots = await prisma.assignmentSlot.findMany({
    where: { participantId: { not: null } },
    include: {
      participant: { select: { id: true, sex: true } },
      weekPart: { include: { partType: true } },
    },
  });

  const totalsByParticipant = new Map<string, CounterTotals>();

  for (const slot of slots) {
    const participantId = slot.participantId;
    if (!participantId || !slot.participant) continue;

    const categories = resolveCountCategories({
      partTypeCode: slot.weekPart.partType.code,
      partTopic: slot.weekPart.partType.topic as PartTopic,
      role: slot.role as AssignmentRole,
      participantSex: slot.participant.sex as Sex,
    });
    if (categories.length === 0) continue;

    const totals = totalsByParticipant.get(participantId) ?? emptyCounters();
    for (const category of categories) {
      const field = counterFieldForCategory(category);
      totals[field] += 1;
    }
    totalsByParticipant.set(participantId, totals);
  }

  for (const [participantId, totals] of totalsByParticipant) {
    await prisma.participant.update({
      where: { id: participantId },
      data: totals,
    });
  }

  console.log(
    `Recalculated counters for ${totalsByParticipant.size} participant(s) from ${slots.length} assigned slot(s).`,
  );
}

if (require.main === module) {
  recalcCounters()
    .catch((error) => {
      console.error("recalc-counters failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
