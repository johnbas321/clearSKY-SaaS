import express from 'express';
import cors from 'cors';
import usermanRouter from './routes/userman.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.use('/users', usermanRouter);

app.listen(PORT, () => {
  console.log(`User management service running on port ${PORT}`);
});