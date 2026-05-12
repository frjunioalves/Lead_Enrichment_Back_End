// Ponto de entrada da aplicação — configura middlewares, rotas e inicia o servidor HTTP
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cnpjRoutes from './routes/cnpj.routes.js';
import leadRoutes from './routes/lead.routes.js';
import leadHistoryRoutes from './routes/leadHistory.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setupSwagger } from './docs/index.js';

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leads', leadHistoryRoutes);
app.use('/cnpj', cnpjRoutes);

// Middleware de erros deve ser registrado após todas as rotas
app.use(errorHandler);

const PORT = process.env['PORT'] ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
