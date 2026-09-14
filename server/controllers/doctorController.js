import Patient from "../models/Patient.js";
import redisClient from "../config/redis.js";

// export const handleNext = async (req,res) =>{
//     try{
//         const patient = await Patient.findOne({status: "IN_SERVICE"});
//         if(patient){
//             patient.status="COMPLETED";
//             patient.completedAt = new Date();
//             await patient.save();
//         }

//         const nextToken = await redisClient.lPop("queue:waiting");
//         if (!nextToken) {
//             return res.status(200).json({
//             message: "No waiting patient found",
//         });
//         }

//         const tokenNumber = Number(nextToken);
//         const nextPatient = await Patient.findOne({ token: tokenNumber });
//         if (!nextPatient) {
//             return res.status(404).json({
//             message: "Patient not found in MongoDB",
//         });
//         }

//         // const patient2 = await Patient.findOne({status: "WAITING"}).sort({token: 1})
//         // if(!patient2){
//         //     return res.status(400).json({message:"No waiting patient found"});
//         // }
//         if(nextPatient.status !== "WAITING"){
//             return res.status(409).json({message :"Redis data is inconsistent"})
//         }

//         nextPatient.status="IN_SERVICE";
//         nextPatient.serviceStartedAt = new Date();
//         await nextPatient.save();

//         return res.status(200).json({
//             nextPatient
//         })

//     }
//     catch(e){
//         return res.status(500).json({message: "Error cannot do next"})

//     }
// }

export const handleNext = async (req, res) => {
  try {
    // 1. Current IN_SERVICE patient find karo
    const currentPatient = await Patient.findOne({
      status: "IN_SERVICE",
    });

    // 2. Current patient ko complete karo
    if (currentPatient) {
      currentPatient.status = "COMPLETED";
      currentPatient.completedAt = new Date();

      await currentPatient.save();
    }

    // 3. Redis se next waiting token dekho
    // Abhi remove nahi kar rahe, sirf check kar rahe hain
    const nextToken = await redisClient.lIndex("queue:waiting", 0);

    // 4. Agar next patient nahi hai
    if (!nextToken) {
      return res.status(200).json({
        message: "Current patient completed, queue is empty",
        completedPatient: currentPatient,
        nextPatient: null,
      });
    }

    // 5. Redis token ko number mein convert karo
    const tokenNumber = Number(nextToken);

    // 6. MongoDB mein next patient find karo
    const nextPatient = await Patient.findOne({
      token: tokenNumber,
      status: "WAITING",
    });

    // 7. Redis aur MongoDB data mismatch
    if (!nextPatient) {
      return res.status(409).json({
        message: "Redis and MongoDB data are inconsistent",
      });
    }

    // 8. Next patient ko IN_SERVICE karo
    nextPatient.status = "IN_SERVICE";
    nextPatient.serviceStartedAt = new Date();

    await nextPatient.save();

    // 9. MongoDB update successful hone ke baad
    // Redis se first waiting token remove karo
    await redisClient.lPop("queue:waiting");

    // 10. Final response
    return res.status(200).json({
      message: "Next patient called successfully",
      completedPatient: currentPatient,
      nextPatient: nextPatient,
    });
  } catch (error) {
    console.error("Handle next error:", error);

    return res.status(500).json({
      message: "Error while calling next patient",
    });
  }
};

export const getQueue = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Cannot get the Patients" });
  }
};

export const skipPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ status: "IN_SERVICE" });
    if (!patient) {
      return res.status(404).json({ message: "No patient is currently in service" });
    }
    if (patient) {
      patient.status = "SKIPPED";
      patient.skippedAt = new Date();
      await patient.save();
    }
    const nextToken = await redisClient.lIndex("queue:waiting", 0);
    if (!nextToken) {
        return res.status(200).json({
            message: "Current patient skipped, queue is empty",
            completedPatient: patient,
            nextPatient: null,
        });
    }
    const tokenNumber = Number(nextToken);
    const nextPatient = await Patient.findOne({token:tokenNumber,status:"WAITING"});
    if (!nextPatient) {
      return res.status(409).json({ message: "inconsistency between redis and mongodb" });
    }

    nextPatient.status = "IN_SERVICE";
    nextPatient.serviceStartedAt = new Date();
    await nextPatient.save();

    await redisClient.lPop("queue:waiting");

    return res.status(200).json({
      message: "Patient skipped and next patient called",
      skippedPatient: patient,
      nextPatient: nextPatient,
    });
    } catch (error) {
    console.error("Skip patient error:", error);

    return res.status(500).json({
      message: "Cannot skip patient",
    });
  }
};

export const getQueueStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const inService = await Patient.countDocuments({ status: "IN_SERVICE" });
    const waiting = await Patient.countDocuments({ status: "WAITING" });
    const completed = await Patient.countDocuments({ status: "COMPLETED" });
    const cancelled = await Patient.countDocuments({ status: "CANCELLED" });
    const skipped = await Patient.countDocuments({ status: "SKIPPED" });

    return res.status(200).json({
      totalPatients,
      waiting,
      inService,
      completed,
      cancelled,
      skipped,
    });
  } catch (e) {
    return res.status(500).json({ message: "Cannot get the Patients" });
  }
};
