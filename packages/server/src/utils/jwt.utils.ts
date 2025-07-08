import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Firma un payload para crear un token JWT.
 * @param payload El objeto que se incluirá en el token (ej. { userId: '...' }).
 * @returns El token JWT como una cadena de texto.
 */
export const signToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Verifica un token JWT y devuelve su payload si es válido.
 * @template T El tipo esperado del payload.
 * @param token El token JWT a verificar.
 * @returns El payload decodificado si el token es válido; de lo contrario, null.
 */
export const verifyToken = <T>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    return null;
  }
};