import express, { Application, Request, Response, NextFunction } from 'express';
import { prisma } from './prismaClient';
import router from './routes/index';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()) 
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