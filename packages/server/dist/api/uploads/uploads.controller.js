// filename: packages/server/src/api/uploads/uploads.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP de firma de subidas.
import { generateUploadSignature } from './uploads.service.js';
/**
 * Maneja la petición del frontend para obtener una firma de subida.
 * Llama al servicio, obtiene la firma y la devuelve como respuesta JSON.
 */
export const getUploadSignatureHandler = (_req, // No necesitamos la request, pero la incluimos por consistencia
res, next) => {
    try {
        const signatureData = generateUploadSignature();
        res.status(200).json({ success: true, data: signatureData });
    }
    catch (error) {
        // Aunque es poco probable que la generación de la firma falle si la config es correcta,
        // es buena práctica tener el manejo de errores.
        next(error);
    }
};
