export const errorHandler = (err, _req, res, _next) => {
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
