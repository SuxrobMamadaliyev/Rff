// -----------------------------------------------------------------------------
// Route registration entry point.
// -----------------------------------------------------------------------------
import { registerAdminRoutes } from './adminRoutes.js';
import { registerUserRoutes } from './userRoutes.js';

export const registerRoutes = (bot) => {
  registerAdminRoutes(bot);
  registerUserRoutes(bot);
  // Fallback text handler userRoutes.js ichida
};

export default registerRoutes;
