-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "status" "VisitStatus" NOT NULL DEFAULT 'PENDING';
