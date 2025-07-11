-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "priority" "IncidentPriority",
ADD COLUMN     "resolutionDeadline" TIMESTAMP(3);
