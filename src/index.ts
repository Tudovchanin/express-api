import express, { Application, Request, Response } from 'express';
import { prisma } from './prismaClient';
import router from './routes/index';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()) 
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})