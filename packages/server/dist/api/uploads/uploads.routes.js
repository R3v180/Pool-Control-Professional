// filename: packages/server/src/api/uploads/uploads.routes.ts
// version: 1.0.0
// description: Define el endpoint para obtener la firma de subida.
import { Router } from 'express';
import { getUploadSignatureHandler } from './uploads.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
const uploadsRouter = Router();
// Protegemos la ruta para que solo los usuarios autenticados (ej. un técnico logueado)
// puedan obtener firmas y subir archivos. Esto previene el abuso del servicio.
uploadsRouter.use(protect);
/**
 * @route   GET /api/uploads/signature
 * @desc    Obtiene una firma y timestamp para autorizar una subida a Cloudinary.
 * @access  Private
 */
uploadsRouter.get('/signature', getUploadSignatureHandler);
export default uploadsRouter;
