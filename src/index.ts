import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma } from './prismaClient';
import cookieParser from 'cookie-parser';

import router from './routes/index';

const app: Application = express();
const PORT = process.env.PORT || 3000;

console.log(process.env.PORT, 'process.env.PORT');


const SECRET_COOKIE = process.env.COOKIE_SECRET;

// 'http://127.0.0.1:5500' - Local live server domain for testing index.html with CORS

const allowedOrigins: string[]= [process.env.CLIENT_URL!];



app.use(cors({
  origin: (origin: string | undefined, callback:(err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);  // разрешаем запросы без origin (Postman, same-origin)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(cookieParser(SECRET_COOKIE));
app.use(express.json({ limit: '50kb' }));
app.use('/api', router);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); 
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})