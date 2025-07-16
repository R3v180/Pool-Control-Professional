// filename: packages/server/src/api/zones/zones.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el recurso de Zonas.
import { Router } from 'express';
import { createZoneHandler, getZonesByTenantHandler, updateZoneHandler, deleteZoneHandler, } from './zones.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const zonesRouter = Router();
// Aplicamos la seguridad a todas las rutas de este fichero.
// 1. `protect`: Asegura que el usuario esté autenticado.
// 2. `authorize('ADMIN')`: Asegura que el rol del usuario sea ADMIN.
zonesRouter.use(protect, authorize('ADMIN'));
// Rutas para /api/zones
zonesRouter.route('/')
    .get(getZonesByTenantHandler)
    .post(createZoneHandler);
// Rutas para /api/zones/:id
zonesRouter.route('/:id')
    .patch(updateZoneHandler)
    .delete(deleteZoneHandler);
export default zonesRouter;
