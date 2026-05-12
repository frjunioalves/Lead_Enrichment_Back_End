import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { swaggerSpec } from './swagger.js';

export function setupSwagger(app: Express): void {
  // Express 5 não achata arrays de middleware automaticamente — separar serve do setup
  app.use('/api/docs', ...swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(swaggerSpec));
}
