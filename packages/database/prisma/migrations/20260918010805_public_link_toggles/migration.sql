-- AlterTable
ALTER TABLE "CongregationSettings" ADD COLUMN     "publicLinkCurrentWeekEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicLinkNextWeekEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicLinkCurrentMonthEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicLinkNextMonthEnabled" BOOLEAN NOT NULL DEFAULT true;
