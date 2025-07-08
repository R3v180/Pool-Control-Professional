import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Genera el hash de una contraseña en texto plano.
 * @param password La contraseña en texto plano.
 * @returns Una promesa que resuelve en el hash de la contraseña.
 */
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compara una contraseña en texto plano con un hash.
 * @param password La contraseña en texto plano a comparar.
 * @param hash El hash almacenado en la base de datos.
 * @returns Una promesa que resuelve en `true` si las contraseñas coinciden, `false` en caso contrario.
 */
export const comparePassword = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};