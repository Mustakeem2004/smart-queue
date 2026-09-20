import Patient from "../models/Patient.js";
import Visit from "../models/Visit.js";
import redisClient from "../config/redis.js";

export const createPatient = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }
    let patient = await Patient.findOne({ phone });

    if (!patient) {
      patient = await Patient.create({
        name,
        phone,
      });
    }

    return res.status(201).json({
      message: "Patient found/created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(500).json({
      message: "Cannot create patient",
    });
  }
};



export const cancelVisit = async (req, res) => {
    try {
        const { trackingId } = req.params;

        // 1. Visit find karo using secure trackingId
        const visit = await Visit.findOne({
            trackingId
        });

        if (!visit) {
            return res.status(404).json({
                message: "Visit not found"
            });
        }

        // 2. Sirf WAITING visit cancel ho sakti hai
        if (visit.status !== "WAITING") {
            return res.status(400).json({
                message: "Only a waiting visit can be cancelled"
            });
        }

        // 3. Redis se visit remove karo
        const removed = await redisClient.lRem(
            `queue:${visit.queueId}`,
            0,
            visit._id.toString()
        );

        if (removed === 0) {
            return res.status(400).json({
                message: "Visit is not present in active queue"
            });
        }

        // 4. MongoDB mein status update
        visit.status = "CANCELLED";
        visit.cancelledAt = new Date();

        await visit.save();

        return res.status(200).json({
            message: "Visit cancelled successfully",
            visit
        });

    } catch (error) {
        console.error("Cancel visit error:", error);

        return res.status(500).json({
            message: "Cannot cancel visit"
        });
    }
};