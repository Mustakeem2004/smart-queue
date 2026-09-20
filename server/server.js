import http from "http";
import express from "express"
import cors from "cors"
import connectDB from "./config/db.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import redisClient from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import scheduleRoutes from "./routes/scheduleRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { initSocket } from "./config/socket.js";
// import { Server } from "socket.io";
dotenv.config();

const app=express();


// Hum Express ko HTTP server ke saath attach kar rahe hain.
const httpServer = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

initSocket(httpServer);


// Yahan Socket.IO ko hamare HTTP server ke saath connect kiya.
// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });


// Jab React se koi user connect hota hai:
// "connection"
// event fire hota hai.

// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });
app.use("/api/hospital",hospitalRoutes);
app.use("/api/patient",patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/schedule", scheduleRoutes);





const startServer = async () =>{
  try{
    await connectDB();
    await redisClient.connect();
    console.log("Redis connected");

    httpServer.listen(8000, () => {
      console.log(`Server running on port 8000`);
    });
  }
  catch(error){
    console.error("Server startup error:", error.message);
  }
}

startServer();