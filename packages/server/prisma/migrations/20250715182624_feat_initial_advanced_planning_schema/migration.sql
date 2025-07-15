-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAYMENT_PENDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "IncidentTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATION', 'STATUS_CHANGE', 'COMMENT', 'DEADLINE_REQUEST', 'DEADLINE_UPDATE');

-- CreateEnum
CREATE TYPE "BillingModel" AS ENUM ('SERVICE_ONLY', 'FEE_PLUS_MATERIALS', 'ALL_INCLUSIVE');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "technicianId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RouteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteTemplateSeason" (
    "id" TEXT NOT NULL,
    "routeTemplateId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteTemplateSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialWorkOrder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "poolId" TEXT NOT NULL,
    "visitId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SpecialWorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParameterTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "type" "InputType" NOT NULL,
    "selectOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ParameterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledTaskTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ScheduledTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingModel" "BillingModel" NOT NULL DEFAULT 'SERVICE_ONLY',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "volume" INTEGER,
    "type" TEXT,
    "qrCode" TEXT,
    "zoneId" TEXT,
    "planningNotes" TEXT,
    "clientId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolConfiguration" (
    "id" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION,
    "maxThreshold" DOUBLE PRECISION,
    "lastCompleted" TIMESTAMP(3),
    "poolId" TEXT NOT NULL,
    "parameterTemplateId" TEXT,
    "taskTemplateId" TEXT,

    CONSTRAINT "PoolConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "hasIncident" BOOLEAN NOT NULL DEFAULT false,
    "completedTasks" TEXT[],
    "technicianId" TEXT,
    "poolId" TEXT NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitResult" (
    "id" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "parameterUnit" TEXT,
    "value" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,

    CONSTRAINT "VisitResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumption" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "visitId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" "IncidentPriority",
    "resolutionNotes" TEXT,
    "resolutionDeadline" TIMESTAMP(3),
    "visitId" TEXT,
    "parentNotificationId" TEXT,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "IncidentImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IncidentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "IncidentPriority" NOT NULL DEFAULT 'NORMAL',
    "resolutionNotes" TEXT,
    "deadline" TIMESTAMP(3),
    "assignedToId" TEXT,
    "notificationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "IncidentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentTaskLog" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentTaskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "IncidentTaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProductPricing" (
    "id" TEXT NOT NULL,
    "discountPercentage" DOUBLE PRECISION NOT NULL,
    "clientId" TEXT NOT NULL,
    "productId" TEXT,
    "productCategoryId" TEXT,

    CONSTRAINT "ClientProductPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "notes" TEXT,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RouteZones" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "Tenant_subdomain_idx" ON "Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_tenantId_key" ON "Zone"("name", "tenantId");

-- CreateIndex
CREATE INDEX "RouteTemplate_tenantId_dayOfWeek_idx" ON "RouteTemplate"("tenantId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "RouteTemplate_name_tenantId_key" ON "RouteTemplate"("name", "tenantId");

-- CreateIndex
CREATE INDEX "RouteTemplateSeason_routeTemplateId_idx" ON "RouteTemplateSeason"("routeTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialWorkOrder_visitId_key" ON "SpecialWorkOrder"("visitId");

-- CreateIndex
CREATE INDEX "SpecialWorkOrder_tenantId_status_idx" ON "SpecialWorkOrder"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ParameterTemplate_name_tenantId_key" ON "ParameterTemplate"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledTaskTemplate_name_tenantId_key" ON "ScheduledTaskTemplate"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_tenantId_key" ON "ProductCategory"("name", "tenantId");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_tenantId_key" ON "Product"("name", "tenantId");

-- CreateIndex
CREATE INDEX "Client_tenantId_idx" ON "Client"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Pool_qrCode_key" ON "Pool"("qrCode");

-- CreateIndex
CREATE INDEX "Pool_tenantId_clientId_idx" ON "Pool"("tenantId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolConfiguration_poolId_parameterTemplateId_key" ON "PoolConfiguration"("poolId", "parameterTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolConfiguration_poolId_taskTemplateId_key" ON "PoolConfiguration"("poolId", "taskTemplateId");

-- CreateIndex
CREATE INDEX "Visit_poolId_timestamp_idx" ON "Visit"("poolId", "timestamp");

-- CreateIndex
CREATE INDEX "Visit_technicianId_timestamp_idx" ON "Visit"("technicianId", "timestamp");

-- CreateIndex
CREATE INDEX "Consumption_visitId_idx" ON "Consumption"("visitId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "IncidentTask_assignedToId_status_idx" ON "IncidentTask"("assignedToId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProductPricing_clientId_productId_key" ON "ClientProductPricing"("clientId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProductPricing_clientId_productCategoryId_key" ON "ClientProductPricing"("clientId", "productCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "_RouteZones_AB_unique" ON "_RouteZones"("A", "B");

-- CreateIndex
CREATE INDEX "_RouteZones_B_index" ON "_RouteZones"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplate" ADD CONSTRAINT "RouteTemplate_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplate" ADD CONSTRAINT "RouteTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplateSeason" ADD CONSTRAINT "RouteTemplateSeason_routeTemplateId_fkey" FOREIGN KEY ("routeTemplateId") REFERENCES "RouteTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialWorkOrder" ADD CONSTRAINT "SpecialWorkOrder_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialWorkOrder" ADD CONSTRAINT "SpecialWorkOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialWorkOrder" ADD CONSTRAINT "SpecialWorkOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParameterTemplate" ADD CONSTRAINT "ParameterTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTaskTemplate" ADD CONSTRAINT "ScheduledTaskTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolConfiguration" ADD CONSTRAINT "PoolConfiguration_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolConfiguration" ADD CONSTRAINT "PoolConfiguration_parameterTemplateId_fkey" FOREIGN KEY ("parameterTemplateId") REFERENCES "ParameterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolConfiguration" ADD CONSTRAINT "PoolConfiguration_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "ScheduledTaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitResult" ADD CONSTRAINT "VisitResult_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parentNotificationId_fkey" FOREIGN KEY ("parentNotificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentImage" ADD CONSTRAINT "IncidentImage_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentImage" ADD CONSTRAINT "IncidentImage_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTask" ADD CONSTRAINT "IncidentTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTask" ADD CONSTRAINT "IncidentTask_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTask" ADD CONSTRAINT "IncidentTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTaskLog" ADD CONSTRAINT "IncidentTaskLog_incidentTaskId_fkey" FOREIGN KEY ("incidentTaskId") REFERENCES "IncidentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTaskLog" ADD CONSTRAINT "IncidentTaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProductPricing" ADD CONSTRAINT "ClientProductPricing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProductPricing" ADD CONSTRAINT "ClientProductPricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProductPricing" ADD CONSTRAINT "ClientProductPricing_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RouteZones" ADD CONSTRAINT "_RouteZones_A_fkey" FOREIGN KEY ("A") REFERENCES "RouteTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RouteZones" ADD CONSTRAINT "_RouteZones_B_fkey" FOREIGN KEY ("B") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
