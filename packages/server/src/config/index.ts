// filename: packages/server/src/config/index.ts
// version: 2.0.0 (Add Cloudinary credentials)

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Recreación de __dirname para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---------------------------------------------

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
};

const config = {
  PORT: parseInt(getEnvVar('PORT'), 10),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: parseInt(getEnvVar('JWT_EXPIRES_IN'), 10),
  DATABASE_URL: getEnvVar('DATABASE_URL'),

  // --- Nuevas credenciales de Cloudinary ---
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET'),
};

export default config;