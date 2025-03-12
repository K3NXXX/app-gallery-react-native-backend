import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import authRoute from "./routes/authRoute.js";


const app = express();
const prisma = new PrismaClient(); 

dotenv.config();
app.use(express.json());

const PORT = process.env.PORT;

prisma.$connect()
  .then(() => {
    console.log('Connected to the database successfully');
  })
  .catch((error: any) => {
    console.error('Error connecting to the database:', error);
  });



app.use("/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
