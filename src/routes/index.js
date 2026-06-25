import { registerAdminRoutes } from './adminRoutes.js';
import { registerUserRoutes } from './userRoutes.js';

export const registerRoutes = (bot) => {
  registerAdminRoutes(bot);
  registerUserRoutes(bot);
};

export default registerRoutes;

