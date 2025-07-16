import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password.utils.js';
const prisma = new PrismaClient();
/**
 * Registra un nuevo usuario en la base de datos.
 * @param input - Datos del usuario para el registro.
 * @returns El objeto de usuario creado (sin la contraseña).
 */
export const register = async (input) => {
    const { email, password, ...rest } = input;
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('Ya existe un usuario con este correo electrónico.');
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            ...rest,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            tenantId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
/**
 * Valida las credenciales de un usuario para el login.
 * @param input - Email y contraseña del usuario.
 * @returns El objeto de usuario autenticado (sin la contraseña).
 */
export const login = async (input) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (!user) {
        throw new Error('El email o la contraseña son incorrectos.');
    }
    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
        throw new Error('El email o la contraseña son incorrectos.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
