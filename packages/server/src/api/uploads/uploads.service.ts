// filename: packages/server/src/api/uploads/uploads.service.ts
// version: 1.0.0
// description: Servicio para generar firmas seguras para la subida de archivos a Cloudinary.

import { v2 as cloudinary } from 'cloudinary';
import config from '../../config/index.js';

// --- Configuración del SDK de Cloudinary ---
// Se configura una única vez al cargar el módulo, utilizando las credenciales
// de nuestro archivo de configuración centralizado.
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true, // Siempre usar https para las URLs
});

/**
 * Genera una firma segura para autorizar una subida desde el cliente.
 * Este método no sube ningún archivo, solo crea las credenciales temporales.
 * @returns Un objeto que contiene la firma, el timestamp y la api_key.
 */
export const generateUploadSignature = () => {
  // El timestamp es necesario para que Cloudinary pueda verificar que la firma
  // no es demasiado antigua y prevenir ataques de repetición.
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Utilizamos la utilidad de Cloudinary para firmar los parámetros.
  // En este caso, solo necesitamos firmar el timestamp, pero se podrían
  // añadir más parámetros como transformaciones, carpetas, etc.
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    config.CLOUDINARY_API_SECRET
  );

  // El frontend necesitará estos tres datos para poder autenticar
  // la petición de subida directamente contra la API de Cloudinary.
  return {
    timestamp,
    signature,
    apiKey: config.CLOUDINARY_API_KEY,
    cloudName: config.CLOUDINARY_CLOUD_NAME,
  };
};