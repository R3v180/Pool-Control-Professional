// filename: packages/server/src/api/pool-configurations/pool-configurations.routes.ts
// Version: 1.1.0 (Add PATCH route for update functionality)
import { Router } from 'express';
import {
  createPoolConfigurationHandler,
  deletePoolConfigurationHandler,
  getConfigurationsByPoolHandler,
  updatePoolConfigurationHandler,
} from './pool-configurations.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const poolConfigurationsRouter = Router();

poolConfigurationsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

poolConfigurationsRouter.route('/')
  .post(createPoolConfigurationHandler);

poolConfigurationsRouter.route('/by-pool/:poolId')
  .get(getConfigurationsByPoolHandler);

poolConfigurationsRouter.route('/:id')
  .patch(updatePoolConfigurationHandler) // Nueva ruta PATCH
  .delete(deletePoolConfigurationHandler);

export default poolConfigurationsRouter;