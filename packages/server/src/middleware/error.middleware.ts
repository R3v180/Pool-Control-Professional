import type { Request, Response, NextFunction } from 'express';

// Interfaz para asegurar que nuestros errores puedan tener un código de estado
interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Guardamos el error en la consola para depuración
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ha ocurrido un error inesperado en el servidor.';

  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: message,
  });
};