import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cnpjRoutes from './routes/cnpj.routes.js';
import leadRoutes from './routes/lead.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cnpj', cnpjRoutes);
app.use('/api/leads', leadRoutes);

app.use(errorHandler);

const PORT = process.env['PORT'] ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
