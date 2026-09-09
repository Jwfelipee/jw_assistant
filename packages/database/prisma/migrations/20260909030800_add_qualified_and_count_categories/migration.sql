-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "qualified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "presidenteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "oracaoCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ministerioCount" INTEGER NOT NULL DEFAULT 0;
