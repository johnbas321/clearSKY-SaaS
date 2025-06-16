import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: 'http://localhost',
  credentials: true}));

app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
