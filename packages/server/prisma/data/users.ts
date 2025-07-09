// filename: packages/server/prisma/data/users.ts
// version: 1.0.1
// description: Datos de semilla para los usuarios del tenant de prueba "Piscival S.L.".

import type { UserRole } from '@prisma/client';

/**
 * Define los usuarios que se crearán para el tenant principal de prueba.
 * Se especifica el tipo UserRole para cumplir con la validación estricta de Prisma.
 */
export const usersData: { name: string; email: string; password: string; role: UserRole }[] = [
  // --- ROL: Administradora ---
  {
    name: 'Isa Gestora',
    email: 'admin@piscival.com',
    password: 'password123',
    role: 'ADMIN',
  },

  // --- ROL: Técnicos de Campo ---
  {
    name: 'Carlos Técnico',
    email: 'carlos.t@piscival.com',
    password: 'password123',
    role: 'TECHNICIAN',
  },
  {
    name: 'Ana Técnica',
    email: 'ana.t@piscival.com',
    password: 'password123',
    role: 'TECHNICIAN',
  },
  {
    name: 'Leo Ayudante',
    email: 'leo.a@piscival.com',
    password: 'password123',
    role: 'TECHNICIAN',
  },

  // --- ROL: Gerencia/Supervisor (para futuras funcionalidades) ---
  {
    name: 'Jorge Supervisor',
    email: 'manager@piscival.com',
    password: 'password123',
    role: 'MANAGER',
  },
];