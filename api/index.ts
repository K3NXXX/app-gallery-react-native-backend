import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import authRoute from "./routes/authRoute.js";
import photosRoute from "./routes/photosRoute.js";
import cors from "cors";
import os from "os"



const app = express();
const prisma = new PrismaClient(); 

dotenv.config();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }))  
app.use(express.urlencoded({ limit: '10mb', extended: true }))

const PORT = process.env.PORT;

prisma.$connect()
  .then(() => {
    console.log('Connected to the database successfully');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });



app.use("/auth", authRoute);
app.use("/photos", photosRoute);

app.get("/", (req: any, res: any) => res.send("Server is running"))

function getIPAddress(): string {
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        // Переконаємося, що це локальна IP-адреса
        if (details.address.startsWith("192.168.") || details.address.startsWith("10.")) {
          return details.address; 
        }
        localIP = details.address;
      }
    }
  }
  return localIP;
}
const ipAddress = getIPAddress();

app.listen(PORT, () => {
  console.log(`Server is running at http://${ipAddress}:${PORT}`);
});
