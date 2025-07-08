import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Empezando el proceso de seeding...');

  // 1. Eliminar datos antiguos para asegurar un estado limpio
  // La eliminación debe ser en el orden correcto para no violar las restricciones de clave foránea.
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('🗑️ Datos antiguos eliminados.');

  // 2. Crear el Tenant del Sistema
  const systemTenant = await prisma.tenant.create({
    data: {
      companyName: 'SYSTEM_INTERNAL',
      subdomain: 'system',
      subscriptionStatus: 'ACTIVE',
    },
  });
  console.log(`🏢 Tenant del sistema creado: ${systemTenant.companyName}`);

  // 3. Hashear la contraseña del SuperAdmin
  const password = 'superadmin123';
  const hashedPassword = await hashPassword(password);
  console.log('🔑 Contraseña del SuperAdmin hasheada.');

  // 4. Crear el usuario SuperAdmin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super@admin.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tenantId: systemTenant.id, // Se asigna al tenant del sistema
    },
  });
  console.log(`👤 Usuario SuperAdmin creado: ${superAdmin.email}`);

  console.log('✅ Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });