import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = 5500;

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true}));

app.use(cookieParser());
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(PORT ,() => {
  console.log(`Grading service running on port ${PORT}`);
});