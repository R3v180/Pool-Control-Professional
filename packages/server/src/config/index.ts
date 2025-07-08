import dotenv from 'dotenv';
import path from 'path';

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
  // Leemos el número de segundos directamente
  JWT_EXPIRES_IN: parseInt(getEnvVar('JWT_EXPIRES_IN'), 10),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
};

export default config;