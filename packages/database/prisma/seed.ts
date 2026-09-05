/**
 * Database seed — idempotent (safe to re-run).
 *
 * Upserts admin user, congregation settings, system/default part types,
 * and alert config by unique keys (email, code, privilege, settings id).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import * as bcrypt from "bcryptjs";
import {
  AssignmentRole,
  PartTopic,
  Privilege,
  PrismaClient,
  Sex,
  SlotMode,
  Weekday,
} from "@prisma/client";

loadEnv({ path: resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();

const MALE_PRIVILEGES: Privilege[] = [
  Privilege.ELDER,
  Privilege.MINISTERIAL_SERVANT,
  Privilege.REGULAR_PIONEER,
  Privilege.BAPTIZED,
  Privilege.PUBLISHER,
];

const ALL_PRIVILEGES = Object.values(Privilege);

type PartTypeSeed = {
  code: string;
  label: string;
  topic: PartTopic;
  allowedSexes: Sex[];
  slotMode: SlotMode;
  roles: AssignmentRole[];
  privileges: Privilege[];
  isSystem: boolean;
  countsAsMinistryPractice: boolean;
  deletable: boolean;
  defaultSortOrder: number;
};

const PART_TYPES: PartTypeSeed[] = [
  // Out-of-topic (system)
  {
    code: "PRESIDENTE",
    label: "Presidente",
    topic: PartTopic.OUT_OF_TOPIC,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 0,
  },
  {
    code: "ORACAO_INICIAL",
    label: "Oração inicial",
    topic: PartTopic.OUT_OF_TOPIC,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 1,
  },
  {
    code: "ORACAO_FINAL",
    label: "Oração final",
    topic: PartTopic.OUT_OF_TOPIC,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 99,
  },
  // Tesouros (system)
  {
    code: "TESOUROS",
    label: "Tesouros da Palavra de Deus",
    topic: PartTopic.TREASURES,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 10,
  },
  {
    code: "JOIAS",
    label: "Joias espirituais",
    topic: PartTopic.TREASURES,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 11,
  },
  {
    code: "LEITURA_BIBLIA",
    label: "Leitura da Bíblia",
    topic: PartTopic.TREASURES,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: true,
    countsAsMinistryPractice: true,
    deletable: false,
    defaultSortOrder: 12,
  },
  // FSM defaults (≥3) — user-deletable catalog entries
  {
    code: "FSM_INICIANDO",
    label: "Iniciando conversas",
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    slotMode: SlotMode.TWO,
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    privileges: ALL_PRIVILEGES,
    isSystem: false,
    countsAsMinistryPractice: true,
    deletable: true,
    defaultSortOrder: 20,
  },
  {
    code: "FSM_CULTIVANDO",
    label: "Cultivando o interesse",
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    slotMode: SlotMode.TWO,
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    privileges: ALL_PRIVILEGES,
    isSystem: false,
    countsAsMinistryPractice: true,
    deletable: true,
    defaultSortOrder: 21,
  },
  {
    code: "FSM_DISCURSO",
    label: "Discurso",
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: false,
    countsAsMinistryPractice: true,
    deletable: true,
    defaultSortOrder: 22,
  },
  // NVC defaults (≥2) + system study
  {
    code: "NVC_NECESSIDADES",
    label: "Necessidades locais",
    topic: PartTopic.CHRISTIAN_LIFE,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    isSystem: false,
    countsAsMinistryPractice: false,
    deletable: true,
    defaultSortOrder: 30,
  },
  {
    code: "NVC_VIDA_CRISTA",
    label: "Vida cristã",
    topic: PartTopic.CHRISTIAN_LIFE,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.ONE,
    roles: [AssignmentRole.TITULAR],
    privileges: MALE_PRIVILEGES,
    isSystem: false,
    countsAsMinistryPractice: false,
    deletable: true,
    defaultSortOrder: 31,
  },
  {
    code: "ESTUDO_BIBLICO",
    label: "Estudo bíblico de congregação",
    topic: PartTopic.CHRISTIAN_LIFE,
    allowedSexes: [Sex.MALE],
    slotMode: SlotMode.TWO,
    roles: [AssignmentRole.DIRIGENTE, AssignmentRole.LEITOR],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    isSystem: true,
    countsAsMinistryPractice: false,
    deletable: false,
    defaultSortOrder: 90,
  },
];

async function resolveAdminPasswordHash(): Promise<string> {
  const fromEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const password = process.env.ADMIN_PASSWORD ?? "changeme";
  return bcrypt.hash(password, 10);
}

function resolveMeetingWeekday(): Weekday {
  const raw = process.env.MEETING_WEEKDAY?.trim().toUpperCase();
  if (raw && raw in Weekday) {
    return Weekday[raw as keyof typeof Weekday];
  }
  return Weekday.THURSDAY;
}

async function seedAdminUser() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const passwordHash = await resolveAdminPasswordHash();

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  console.log(`✓ User admin: ${email}`);
}

async function seedCongregationSettings() {
  const name =
    process.env.CONGREGATION_NAME?.trim() || "Congregação (placeholder)";
  const meetingWeekday = resolveMeetingWeekday();

  await prisma.congregationSettings.upsert({
    where: { id: 1 },
    create: { id: 1, name, meetingWeekday },
    update: { name, meetingWeekday },
  });

  console.log(`✓ CongregationSettings: ${name} / ${meetingWeekday}`);
}

async function seedPartTypes() {
  for (const pt of PART_TYPES) {
    await prisma.partType.upsert({
      where: { code: pt.code },
      create: pt,
      update: {
        label: pt.label,
        topic: pt.topic,
        allowedSexes: pt.allowedSexes,
        slotMode: pt.slotMode,
        roles: pt.roles,
        privileges: pt.privileges,
        isSystem: pt.isSystem,
        countsAsMinistryPractice: pt.countsAsMinistryPractice,
        deletable: pt.deletable,
        defaultSortOrder: pt.defaultSortOrder,
      },
    });
  }

  const systemCount = PART_TYPES.filter((p) => p.isSystem).length;
  const fsmCount = PART_TYPES.filter((p) => p.topic === PartTopic.MINISTRY).length;
  const nvcDefaults = PART_TYPES.filter(
    (p) => p.topic === PartTopic.CHRISTIAN_LIFE && !p.isSystem,
  ).length;

  console.log(
    `✓ PartTypes: ${PART_TYPES.length} total (${systemCount} system, ${fsmCount} FSM, ${nvcDefaults} NVC defaults + estudo)`,
  );
}

async function seedAlertConfig() {
  const defaults: Record<Privilege, boolean> = {
    [Privilege.ELDER]: false,
    [Privilege.MINISTERIAL_SERVANT]: false,
    [Privilege.REGULAR_PIONEER]: false,
    [Privilege.REGULAR_PIONEER_SISTER]: false,
    [Privilege.BAPTIZED]: true,
    [Privilege.PUBLISHER]: true,
  };

  for (const privilege of ALL_PRIVILEGES) {
    await prisma.alertConfig.upsert({
      where: { privilege },
      create: {
        privilege,
        repeatMonthAlertEnabled: defaults[privilege],
      },
      update: {
        repeatMonthAlertEnabled: defaults[privilege],
      },
    });
  }

  console.log("✓ AlertConfig: Batizado e Publicador com alerta de repetição no mês");
}

async function main() {
  console.log("Seeding database (idempotent)…");
  await seedAdminUser();
  await seedCongregationSettings();
  await seedPartTypes();
  await seedAlertConfig();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
