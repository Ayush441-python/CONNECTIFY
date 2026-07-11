import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import router from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/security.middleware';

const app: Express = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.env !== 'test') {
  app.use(morgan(config.isProd ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter, router);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Connectify API', docs: '/api/health' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
