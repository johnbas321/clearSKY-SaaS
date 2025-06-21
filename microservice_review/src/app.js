import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { appConfig } from './config.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/reviews', router);
app.use(errorHandler);

app.listen(appConfig.port , '0.0.0.0', () => {
  console.log(`Reviews service running on port ${appConfig.port}`);
});