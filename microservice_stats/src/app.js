import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = 6600;

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true}));

app.use(cookieParser());
app.use(express.json());

app.use('/stats', router);
app.use(errorHandler);

app.listen(PORT , '0.0.0.0', () => {
  console.log(`Statistics service running on port ${PORT}`);
});