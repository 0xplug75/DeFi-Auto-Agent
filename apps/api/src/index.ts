import * as dotenv from 'dotenv';

// Charge les variables d'environnement avant tout
dotenv.config();

import express, { Express } from 'express';
import { kilnRoutes } from './routes/kiln';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', kilnRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 