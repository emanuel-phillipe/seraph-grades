import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/userRouting";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"
import { resolve } from "path";
import { subjectRouter } from "./routes/subjectRouting";
import { activityRouter } from "./routes/activityRouting";
import { phaseRouter } from "./routes/phaseRouting";
import cors from "cors"


const app: Express = express();
app.use(express.json())
app.use(cors({
  allowedHeaders: ["Content-Type"],
  methods: "*",
  credentials: true,
  origin: "http://localhost:3000"
}))
app.use(cookieParser())
 
dotenv.config({path: resolve(__dirname, "../.env")});

const connectToDatabase = async () => {
  try {
      mongoose.set('strictQuery', false)
      mongoose.connect(process.env.DB_MONGO) // TO-DO: FAZER O .ENV FUNCIONAR PLMDS
      console.log("Database connected")
  }catch(error){
      console.log(error);
  }
}

// ROTA DE USUÁRIOS (CREATE, DELETE, PUT...)
app.use("/api/v1/user", userRouter);
app.use("/api/v1/subject", subjectRouter);
app.use("/api/v1/activity", activityRouter);
app.use("/api/v1/phase", phaseRouter);

app.get("/teste", (req:Request, res:Response) => {
  return res.status(200).send("Oi")
})

connectToDatabase()
app.listen(3000, ()=>{
  console.log("Server is running");
})