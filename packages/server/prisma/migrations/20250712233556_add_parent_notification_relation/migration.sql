/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consumption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentTaskLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParameterTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PoolConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduledTaskTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Visit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VisitResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_productId_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_visitId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentImage" DROP CONSTRAINT "IncidentImage_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentImage" DROP CONSTRAINT "IncidentImage_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentTask" DROP CONSTRAINT "IncidentTask_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentTask" DROP CONSTRAINT "IncidentTask_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentTask" DROP CONSTRAINT "IncidentTask_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentTaskLog" DROP CONSTRAINT "IncidentTaskLog_incidentTaskId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentTaskLog" DROP CONSTRAINT "IncidentTaskLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_visitId_fkey";

-- DropForeignKey
ALTER TABLE "ParameterTemplate" DROP CONSTRAINT "ParameterTemplate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PoolConfiguration" DROP CONSTRAINT "PoolConfiguration_parameterTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "PoolConfiguration" DROP CONSTRAINT "PoolConfiguration_poolId_fkey";

-- DropForeignKey
ALTER TABLE "PoolConfiguration" DROP CONSTRAINT "PoolConfiguration_taskTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledTaskTemplate" DROP CONSTRAINT "ScheduledTaskTemplate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_poolId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "VisitResult" DROP CONSTRAINT "VisitResult_visitId_fkey";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Consumption";

-- DropTable
DROP TABLE "IncidentImage";

-- DropTable
DROP TABLE "IncidentTask";

-- DropTable
DROP TABLE "IncidentTaskLog";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "ParameterTemplate";

-- DropTable
DROP TABLE "Pool";

-- DropTable
DROP TABLE "PoolConfiguration";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ScheduledTaskTemplate";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Visit";

-- DropTable
DROP TABLE "VisitResult";

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "volume" INTEGER,
    "type" TEXT,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "type" "InputType" NOT NULL DEFAULT 'NUMBER',
    "selectOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "parameter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_task_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "scheduled_task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_configurations" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "parameterTemplateId" TEXT,
    "taskTemplateId" TEXT,
    "frequency" "Frequency" NOT NULL DEFAULT 'SEMANAL',
    "minThreshold" DOUBLE PRECISION,
    "maxThreshold" DOUBLE PRECISION,
    "lastCompleted" TIMESTAMP(3),

    CONSTRAINT "pool_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "hasIncident" BOOLEAN NOT NULL DEFAULT false,
    "completedTasks" TEXT[],
    "poolId" TEXT NOT NULL,
    "technicianId" TEXT,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_results" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "parameterUnit" TEXT,
    "value" TEXT NOT NULL,

    CONSTRAINT "visit_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumptions" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "IncidentPriority",
    "resolutionNotes" TEXT,
    "resolutionDeadline" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitId" TEXT,
    "parentNotificationId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IncidentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "IncidentPriority" NOT NULL DEFAULT 'NORMAL',
    "deadline" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "incident_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,

    CONSTRAINT "incident_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_task_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentTaskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "incident_task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pools_qrCode_key" ON "pools"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_templates_tenantId_name_key" ON "parameter_templates"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_task_templates_tenantId_name_key" ON "scheduled_task_templates"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_name_key" ON "products"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pools" ADD CONSTRAINT "pools_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pools" ADD CONSTRAINT "pools_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parameter_templates" ADD CONSTRAINT "parameter_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_task_templates" ADD CONSTRAINT "scheduled_task_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_configurations" ADD CONSTRAINT "pool_configurations_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_configurations" ADD CONSTRAINT "pool_configurations_parameterTemplateId_fkey" FOREIGN KEY ("parameterTemplateId") REFERENCES "parameter_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_configurations" ADD CONSTRAINT "pool_configurations_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "scheduled_task_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_results" ADD CONSTRAINT "visit_results_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumptions" ADD CONSTRAINT "consumptions_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumptions" ADD CONSTRAINT "consumptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "parent_notification_id" FOREIGN KEY ("parentNotificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_tasks" ADD CONSTRAINT "incident_tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_tasks" ADD CONSTRAINT "incident_tasks_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_tasks" ADD CONSTRAINT "incident_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_images" ADD CONSTRAINT "incident_images_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_images" ADD CONSTRAINT "incident_images_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_task_logs" ADD CONSTRAINT "incident_task_logs_incidentTaskId_fkey" FOREIGN KEY ("incidentTaskId") REFERENCES "incident_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_task_logs" ADD CONSTRAINT "incident_task_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
