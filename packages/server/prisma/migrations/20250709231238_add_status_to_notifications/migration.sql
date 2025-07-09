-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'RESOLVED');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "resolutionNotes" TEXT,
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING';
