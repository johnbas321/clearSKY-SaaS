import express from 'express';
import cors from 'cors';
import gradesRouter from './routes/grades.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(PORT, () => {
  console.log(`Grading service running on port ${PORT}`);
});