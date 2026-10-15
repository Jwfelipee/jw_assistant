-- AlterTable
ALTER TABLE "Week" ADD COLUMN "skippedAt" TIMESTAMP(3),
ADD COLUMN "skipReason" VARCHAR(500);

-- CreateIndex
CREATE INDEX "Week_skippedAt_idx" ON "Week"("skippedAt");
