-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_technicianId_fkey";

-- AlterTable
ALTER TABLE "Visit" ALTER COLUMN "technicianId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
