import express from "express"
import cors from "cors"
import connectDB from "./config/db.js";
import patientRoute from "./routes/patientRoutes.js"
import doctorRoute from "./routes/doctorRoutes.js"
import redisClient from "./config/redis.js";
import dotenv from "dotenv"
dotenv.config();

const app=express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

let nextToken = 1;
let queue = [];

app.use("/api/queue",patientRoute);
app.use("/api/doc",doctorRoute);

// app.post("/api/queue/join", (req, res) => {
//   const { name } = req.body;

//   const patient = {
//     token: nextToken,
//     name: name,
//     status: "WAITING"
//   };

//   queue.push(patient);

//   nextToken++;

//   res.json({
//     message: "Joined queue successfully",
//     patient: patient
//   });
// });


// let currentToken = 0;


// app.post("/api/queue/next", (req, res) => {

//   const InservicePatient = queue.find((patient) => {
//     return patient.status === "IN_SERVICE";
//   });

//   if(InservicePatient){
//      InservicePatient.status = "COMPLETED";
//   }

//   const nextPatient = queue.find((patient) => {
//     return patient.status === "WAITING"
//   }
//   );

//   if (!nextPatient) {
//     return res.status(400).json({
//       message: "No patients waiting"
//     });
//   }

//   nextPatient.status = "IN_SERVICE";
//   currentToken = nextPatient.token;

//   res.json({
//     message: "Patient called",
//     currentToken: currentToken,
//     patient: nextPatient
//   });
// });





// app.get("/api/queue",(req,res)=>{
//     res.json(queue);
// })



// app.get("/api/queue/status/:token",(req,res)=>{
//         const userToken= Number(req.params.token);
//         const patient = queue.find((q) => q.token === userToken);

//         if (!patient) {
//             return res.status(404).json({
//             message: "Patient not found"
//         });
//         }
//         const peopleAhead = queue.filter((q) => {
//             return q.status === "WAITING" && q.token < userToken;
//             }).length;

//         res.json({
//          token: patient.token,
//          name: patient.name,
//          status: patient.status,
//          currentToken: currentToken,
//          peopleAhead: peopleAhead
//         });
// })



// app.post("/api/queue/cancel/:token",(req,res)=>{
//     const userToken = Number(req.params.token);
//     const patient=queue.find((q) => q.token===userToken);
//     if(!patient){
//         return res.status(404).json({"message" : "Patient not found"});
//     }

//     if(patient.status==="WAITING"){
//         patient.status = "CANCELLED";
//     }
//     else{
//         return res.status(400).json({"message" : "user is not in waiting"})
//     }

//     res.json({
//        token: userToken,
//        name:  patient.name,
//        status: patient.status,
//        currentToken: currentToken
//     })

    
// })







const startServer = async () =>{
  try{
    await connectDB();
    await redisClient.connect();
    console.log("Redis connected");

    app.listen(8000, () => {
      console.log(`Server running on port 8000`);
    });
  }
  catch(error){
    console.error("Server startup error:", error.message);
  }
}

startServer();