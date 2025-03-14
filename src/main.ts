import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import authRoute from "./routes/authRoute.js";
import cors from "cors";


const app = express();
const prisma = new PrismaClient(); 

dotenv.config();
app.use(express.json());
app.use(cors({ origin: '*' }));

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
