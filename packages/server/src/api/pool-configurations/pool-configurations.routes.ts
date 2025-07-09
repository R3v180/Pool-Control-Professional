// filename: packages/server/src/api/pool-configurations/pool-configurations.routes.ts
// Version: 1.0.0 (Initial creation of routes for Pool Configurations)
import { Router } from 'express';
import {
  createPoolConfigurationHandler,
  deletePoolConfigurationHandler,
  getConfigurationsByPoolHandler,
} from './pool-configurations.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const poolConfigurationsRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
poolConfigurationsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

// Rutas para crear una nueva configuración.
poolConfigurationsRouter.route('/')
  .post(createPoolConfigurationHandler);

// Ruta para obtener todas las configuraciones de una piscina específica.
poolConfigurationsRouter.route('/by-pool/:poolId')
  .get(getConfigurationsByPoolHandler);

// Ruta para eliminar una configuración específica por su propio ID.
poolConfigurationsRouter.route('/:id')
  .delete(deletePoolConfigurationHandler);

export default poolConfigurationsRouter;