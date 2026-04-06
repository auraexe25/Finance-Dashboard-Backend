import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import recordRoutes from './routes/recordRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import categoryRoutes from './routes/categoryRoutes';
import exportRoutes from './routes/exportRoutes';
import balanceRoutes from './routes/balanceRoutes';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimit } from './middlewares/rateLimit';


dotenv.config();


connectDB();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit(15 * 60 * 1000, 100)); 

// Basic test route
app.get('/', (req: Request, res: Response) => {
  res.send('Finance Dashboard API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/balance', balanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});