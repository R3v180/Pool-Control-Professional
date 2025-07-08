// filename: packages/server/src/api/parameters/parameters.controller.ts
// Version: 1.0.0 (Initial creation of the controller for Parameter Templates)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
createParameterTemplate,
deleteParameterTemplate,
getParameterTemplatesByTenant,
updateParameterTemplate,
} from './parameters.service.js';
/**
Maneja la creación de una nueva plantilla de parámetro.
*/
export const createParameterTemplateHandler = async (
req: AuthRequest,
res: Response,
next: NextFunction
) => {
try {
// Aseguramos que el usuario esté autenticado y tenga un tenantId
const tenantId = req.user?.tenantId;
if (!tenantId) {
return res.status(403).json({ message: 'Acción no permitida.' });
}
const input = { ...req.body, tenantId };
const newTemplate = await createParameterTemplate(input);
res.status(201).json({ success: true, data: newTemplate });
} catch (error) {
next(error);
}
};
/**
Maneja la obtención de todas las plantillas de un tenant.
*/
export const getParameterTemplatesByTenantHandler = async (
req: AuthRequest,
res: Response,
next: NextFunction
) => {
try {
const tenantId = req.user?.tenantId;
if (!tenantId) {
return res.status(403).json({ message: 'Acción no permitida.' });
}
const templates = await getParameterTemplatesByTenant(tenantId);
res.status(200).json({ success: true, data: templates });
} catch (error) {
next(error);
}
};
/**
Maneja la actualización de una plantilla de parámetro.
*/
export const updateParameterTemplateHandler = async (
req: AuthRequest,
res: Response,
next: NextFunction
) => {
try {
const { id } = req.params;
if (!id) {
return res.status(400).json({ message: 'El ID de la plantilla es requerido.' });
}
// TODO: Verificar que la plantilla que se quiere editar pertenece al tenant del usuario logueado.
const updatedTemplate = await updateParameterTemplate(id, req.body);
res.status(200).json({ success: true, data: updatedTemplate });
} catch (error) {
next(error);
}
};
/**
Maneja la eliminación de una plantilla de parámetro.
*/
export const deleteParameterTemplateHandler = async (
req: AuthRequest,
res: Response,
next: NextFunction
) => {
try {
const { id } = req.params;
if (!id) {
return res.status(400).json({ message: 'El ID de la plantilla es requerido.' });
}
// TODO: Verificar que la plantilla que se quiere eliminar pertenece al tenant del usuario logueado.
await deleteParameterTemplate(id);
res.status(204).send();
} catch (error) {
next(error);
}
};