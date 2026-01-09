import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import connectToSocket from "./controllers/socketManager.js";

const app = express();
app.use(cors());
const server = createServer(app);
const io = connectToSocket(server);
const PORT = process.env.PORT || 8000;
const uri = process.env.MONGO_URL;

app.get("/home",(req,res)=>{
  return res.json({"hello": "World"})
});

async function startServer() {
  try {
    await mongoose.connect(uri);
    console.log("DB connected");

    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed ");
    console.error(err.message);
    process.exit(1);
  }
}

startServer();


