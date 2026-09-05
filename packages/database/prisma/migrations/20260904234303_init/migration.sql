-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Privilege" AS ENUM ('ELDER', 'MINISTERIAL_SERVANT', 'REGULAR_PIONEER', 'REGULAR_PIONEER_SISTER', 'BAPTIZED', 'PUBLISHER');

-- CreateEnum
CREATE TYPE "RolePreference" AS ENUM ('ANY', 'PRINCIPAL_ONLY', 'ASSISTANT_ONLY');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('TITULAR', 'AJUDANTE', 'DIRIGENTE', 'LEITOR');

-- CreateEnum
CREATE TYPE "PartTopic" AS ENUM ('OUT_OF_TOPIC', 'TREASURES', 'MINISTRY', 'CHRISTIAN_LIFE');

-- CreateEnum
CREATE TYPE "SlotMode" AS ENUM ('ONE', 'TWO');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CongregationSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "meetingWeekday" "Weekday" NOT NULL DEFAULT 'THURSDAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CongregationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "sex" "Sex" NOT NULL,
    "privilege" "Privilege" NOT NULL,
    "rolePreference" "RolePreference" NOT NULL DEFAULT 'ANY',
    "titularCount" INTEGER NOT NULL DEFAULT 0,
    "ajudanteCount" INTEGER NOT NULL DEFAULT 0,
    "dirigenteCount" INTEGER NOT NULL DEFAULT 0,
    "leitorCount" INTEGER NOT NULL DEFAULT 0,
    "ministryPracticeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantAssociation" (
    "id" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE,
    "justification" TEXT,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartType" (
    "id" TEXT NOT NULL,
    "topic" "PartTopic" NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "allowedSexes" "Sex"[],
    "slotMode" "SlotMode" NOT NULL,
    "roles" "AssignmentRole"[],
    "privileges" "Privilege"[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "countsAsMinistryPractice" BOOLEAN NOT NULL DEFAULT false,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "defaultSortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertConfig" (
    "id" TEXT NOT NULL,
    "privilege" "Privilege" NOT NULL,
    "repeatMonthAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bimester" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "Bimester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Month" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "bimesterId" TEXT NOT NULL,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "meetingDate" DATE NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPart" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "partTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "topic" "PartTopic" NOT NULL,

    CONSTRAINT "WeekPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSlot" (
    "id" TEXT NOT NULL,
    "weekPartId" TEXT NOT NULL,
    "role" "AssignmentRole" NOT NULL,
    "participantId" TEXT,

    CONSTRAINT "AssignmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Participant_name_idx" ON "Participant"("name");

-- CreateIndex
CREATE INDEX "ParticipantAssociation_bId_idx" ON "ParticipantAssociation"("bId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantAssociation_aId_bId_key" ON "ParticipantAssociation"("aId", "bId");

-- CreateIndex
CREATE INDEX "Absence_participantId_status_idx" ON "Absence"("participantId", "status");

-- CreateIndex
CREATE INDEX "Absence_endsOn_status_idx" ON "Absence"("endsOn", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PartType_code_key" ON "PartType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AlertConfig_privilege_key" ON "AlertConfig"("privilege");

-- CreateIndex
CREATE UNIQUE INDEX "Bimester_year_index_key" ON "Bimester"("year", "index");

-- CreateIndex
CREATE INDEX "Month_bimesterId_idx" ON "Month"("bimesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Month_year_month_key" ON "Month"("year", "month");

-- CreateIndex
CREATE INDEX "Week_meetingDate_idx" ON "Week"("meetingDate");

-- CreateIndex
CREATE INDEX "Week_weekStartDate_idx" ON "Week"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "Week_monthId_weekStartDate_key" ON "Week"("monthId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeekPart_weekId_sortOrder_idx" ON "WeekPart"("weekId", "sortOrder");

-- CreateIndex
CREATE INDEX "WeekPart_partTypeId_idx" ON "WeekPart"("partTypeId");

-- CreateIndex
CREATE INDEX "AssignmentSlot_participantId_idx" ON "AssignmentSlot"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSlot_weekPartId_role_key" ON "AssignmentSlot"("weekPartId", "role");

-- AddForeignKey
ALTER TABLE "ParticipantAssociation" ADD CONSTRAINT "ParticipantAssociation_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAssociation" ADD CONSTRAINT "ParticipantAssociation_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Month" ADD CONSTRAINT "Month_bimesterId_fkey" FOREIGN KEY ("bimesterId") REFERENCES "Bimester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPart" ADD CONSTRAINT "WeekPart_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPart" ADD CONSTRAINT "WeekPart_partTypeId_fkey" FOREIGN KEY ("partTypeId") REFERENCES "PartType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSlot" ADD CONSTRAINT "AssignmentSlot_weekPartId_fkey" FOREIGN KEY ("weekPartId") REFERENCES "WeekPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSlot" ADD CONSTRAINT "AssignmentSlot_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
