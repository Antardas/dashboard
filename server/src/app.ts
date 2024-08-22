import express, { Application } from 'express';
import errorMiddleware from './shared/global/helpers/error-middleware';
import cors from 'cors';
import mongoose from 'mongoose';
import dashboardRoutes from './routes/dashboard-routes';

const app: Application = express();
(async () => {
	app.use(cors({ origin: '*' }));
	app.use(express.json());

	app.use(dashboardRoutes);
	app.use(errorMiddleware);
})();
export default app;
