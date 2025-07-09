/*
  Warnings:

  - Made the column `technicianId` on table `Visit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PoolConfiguration" DROP CONSTRAINT "PoolConfiguration_parameterTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "PoolConfiguration" DROP CONSTRAINT "PoolConfiguration_taskTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_technicianId_fkey";

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "hasIncident" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "technicianId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PoolConfiguration" ADD CONSTRAINT "PoolConfiguration_parameterTemplateId_fkey" FOREIGN KEY ("parameterTemplateId") REFERENCES "ParameterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolConfiguration" ADD CONSTRAINT "PoolConfiguration_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "ScheduledTaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
