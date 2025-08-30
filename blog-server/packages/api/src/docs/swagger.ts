// packages/api/src/docs/swagger.ts
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const setupSwaggerDocs = (app: Application) => {
  const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
