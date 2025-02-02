import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express, { Express } from 'express';
import { kilnRoutes } from './routes/kiln';

const app: Express = express();
const PORT = 3005;

app.use(express.json());
app.use('/api', kilnRoutes);

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 