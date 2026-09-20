import Queue from "../models/Queue.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";
import crypto from "crypto";
import Visit from "../models/Visit.js";
import Patient from "../models/Patient.js";
import Schedule from "../models/Schedule.js";
import redisClient from "../config/redis.js";

export const createQueue = async (req, res) => {
    try {
        const { doctorId, scheduleId, date } = req.body;

        if (!doctorId || !scheduleId || !date) {
            return res.status(400).json({
                message: "Doctor, schedule and date are required"
            });
        }

        let hospitalId;

        if (req.user.role === "PLATFORM_ADMIN") {
            hospitalId = req.body.hospitalId;

            if (!hospitalId) {
                return res.status(400).json({
                    message: "hospitalId is required"
                });
            }
        } else {
            hospitalId = req.user.hospitalId;

            if (!hospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }
        }

        // 1. Check hospital
        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        // 2. Check doctor
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // 3. Check doctor belongs to hospital
        if (
            doctor.hospitalId.toString() !==
            hospitalId.toString()
        ) {
            return res.status(403).json({
                message: "Doctor does not belong to this hospital"
            });
        }

        // 4. Check schedule
        const schedule = await Schedule.findById(scheduleId);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        // 5. Check schedule belongs to hospital
        if (
            schedule.hospitalId.toString() !==
            hospitalId.toString()
        ) {
            return res.status(403).json({
                message: "Schedule does not belong to this hospital"
            });
        }

        // 6. Check schedule belongs to doctor
        if (
            schedule.doctorId.toString() !==
            doctorId.toString()
        ) {
            return res.status(403).json({
                message: "Schedule does not belong to this doctor"
            });
        }

        // 7. Check schedule is active
        if (!schedule.isActive) {
            return res.status(400).json({
                message: "Schedule is inactive"
            });
        }

        // 8. Check duplicate queue
        const existingQueue = await Queue.findOne({
            hospitalId,
            doctorId,
            scheduleId,
            date
        });

        if (existingQueue) {
            return res.status(409).json({
                message:
                    "Queue already exists for this doctor, schedule and date"
            });
        }

        // 9. Create queue
        const queue = await Queue.create({
            hospitalId,
            doctorId,
            scheduleId,
            date,
            status: "OPEN",
            openedAt: new Date()
        });

        return res.status(201).json({
            message: "Queue created successfully",
            queue
        });

    } catch (error) {
        console.error("Create queue error:", error);

        return res.status(500).json({
            message: "Cannot create queue"
        });
    }
};




export const getQueues = async (req, res) => {
    try {
        let queues;

        if (req.user.role === "PLATFORM_ADMIN") {
            queues = await Queue.find()
                .populate("hospitalId", "name")
                .populate("doctorId", "name specialization")
                .populate(
                    "scheduleId",
                    "name startTime endTime daysOfWeek"
                );
        } else {
            const hospitalId = req.user.hospitalId;

            if (!hospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }

            queues = await Queue.find({
                hospitalId
            })
                .populate("doctorId", "name specialization")
                .populate(
                    "scheduleId",
                    "name startTime endTime daysOfWeek"
                );
        }

        return res.status(200).json({
            message: "Queues fetched successfully",
            queues
        });

    } catch (error) {
        console.error("Get queues error:", error);

        return res.status(500).json({
            message: "Cannot fetch queues"
        });
    }
};



export const getQueueById = async (req, res) => {
    try {
        const { id } = req.params;

        const queue = await Queue.findById(id)
            .populate("hospitalId", "name")
            .populate("doctorId", "name specialization")
            .populate(
                "scheduleId",
                "name startTime endTime daysOfWeek"
            );

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {

            if (
                queue.hospitalId._id.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to access this queue"
                });
            }
        }

        return res.status(200).json({
            message: "Queue fetched successfully",
            queue
        });

    } catch (error) {
        console.error("Get queue error:", error);

        return res.status(500).json({
            message: "Cannot fetch queue"
        });
    }
};





export const closeQueue = async (req, res) => {
    try {
        const { id } = req.params;

        const queue = await Queue.findById(id);

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // Hospital isolation
        if (req.user.role !== "PLATFORM_ADMIN") {

            if (
                !req.user.hospitalId ||
                queue.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to close this queue"
                });
            }
        }

        // Already closed
        if (queue.status === "CLOSED") {
            return res.status(400).json({
                message: "Queue is already closed"
            });
        }

        // Queue must be open
        if (queue.status !== "OPEN") {
            return res.status(400).json({
                message: "Only an open queue can be closed"
            });
        }

        queue.status = "CLOSED";
        queue.closedAt = new Date();

        await queue.save();

        return res.status(200).json({
            message: "Queue closed successfully",
            queue
        });

    } catch (error) {
        console.error("Close queue error:", error);

        return res.status(500).json({
            message: "Cannot close queue"
        });
    }
};



export const joinQueue = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { name, phone } = req.body;

        // 1. Queue find karo
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // 2. Queue OPEN honi chahiye
        if (queue.status !== "OPEN") {
            return res.status(400).json({
                message: "Queue is not open"
            });
        }

        // 3. Patient data validate karo
        if (!name || !phone) {
            return res.status(400).json({
                message: "Name and phone are required"
            });
        }

        // 4. Existing patient find karo
        let patient = await Patient.findOne({ phone });

        // 5. Patient nahi mila toh create karo
        if (!patient) {
            patient = await Patient.create({
                name,
                phone
            });
        }

        // 6. Check karo patient already
        //    isi queue mein active hai ya nahi
        const existingVisit = await Visit.findOne({
            patientId: patient._id,
            queueId: queue._id,
            status: {
                $in: ["WAITING", "IN_SERVICE"]
            }
        });

        if (existingVisit) {
            return res.status(409).json({
                message: "Patient is already in this queue",
                visit: existingVisit
            });
        }

        // 7. Is queue mein existing visits count karo
        const visitCount = await Visit.countDocuments({
            queueId: queue._id
        });

        // 8. Next token generate karo
        const tokenNumber = visitCount + 1;

        const token = `A${String(tokenNumber).padStart(3, "0")}`;

        // 9. Secure tracking ID generate karo
        const trackingId = crypto
            .randomBytes(32)
            .toString("hex");

        // 10. Visit create karo
        const visit = await Visit.create({
            patientId: patient._id,
            hospitalId: queue.hospitalId,
            doctorId: queue.doctorId,
            queueId: queue._id,
            token,
            trackingId,
            status: "WAITING"
        });


        await redisClient.rPush(
    `queue:${queueId}`,
    visit._id.toString()
);

        // 11. Response
        return res.status(201).json({
            message: "Patient joined queue successfully",
            patient,
            visit
        });

    } catch (error) {
        console.error("Join queue error:", error);

        return res.status(500).json({
            message: "Cannot join queue"
        });
    }
};





export const nextPatient = async (req, res) => {
    try {
        const { queueId } = req.params;

        // 1. Queue find karo
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // 2. Queue OPEN honi chahiye
        if (queue.status !== "OPEN") {
            return res.status(400).json({
                message: "Queue is not open"
            });
        }

        // 3. Hospital isolation
        if (
            req.user.role !== "PLATFORM_ADMIN" &&
            (
                !req.user.hospitalId ||
                queue.hospitalId.toString() !==
                req.user.hospitalId.toString()
            )
        ) {
            return res.status(403).json({
                message: "You are not authorized to access this queue"
            });
        }

        // 4. Redis se next Visit ID nikalo
        const visitId = await redisClient.lPop(
            `queue:${queueId}`
        );

        // 5. Queue empty hai
        if (!visitId) {
            return res.status(404).json({
                message: "No patients waiting in queue"
            });
        }

        // 6. MongoDB se Visit find karo
        const visit = await Visit.findById(visitId);

        if (!visit) {
            return res.status(404).json({
                message: "Visit not found"
            });
        }

        // 7. Visit WAITING honi chahiye
        if (visit.status !== "WAITING") {
            return res.status(400).json({
                message: "Visit is not waiting"
            });
        }

        // 8. Visit ko IN_SERVICE karo
        visit.status = "IN_SERVICE";
        visit.serviceStartedAt = new Date();

        await visit.save();

        return res.status(200).json({
            message: "Next patient called successfully",
            visit
        });

    } catch (error) {
        console.error("Next patient error:", error);

        return res.status(500).json({
            message: "Cannot call next patient"
        });
    }
};




export const completePatient = async (req, res) => {
    try {
        const { queueId, visitId } = req.params;

        // 1. Queue find karo
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // 2. Hospital isolation
        if (
            req.user.role !== "PLATFORM_ADMIN" &&
            (
                !req.user.hospitalId ||
                queue.hospitalId.toString() !==
                req.user.hospitalId.toString()
            )
        ) {
            return res.status(403).json({
                message: "You are not authorized to access this queue"
            });
        }

        // 3. Visit find karo
        const visit = await Visit.findById(visitId);

        if (!visit) {
            return res.status(404).json({
                message: "Visit not found"
            });
        }

        // 4. Check visit isi queue ki hai
        if (visit.queueId.toString() !== queueId.toString()) {
            return res.status(403).json({
                message: "Visit does not belong to this queue"
            });
        }

        // 5. Visit IN_SERVICE honi chahiye
        if (visit.status !== "IN_SERVICE") {
            return res.status(400).json({
                message: "Only an in-service visit can be completed"
            });
        }

        // 6. Complete visit
        visit.status = "COMPLETED";
        visit.completedAt = new Date();

        await visit.save();

        return res.status(200).json({
            message: "Patient consultation completed successfully",
            visit
        });

    } catch (error) {
        console.error("Complete patient error:", error);

        return res.status(500).json({
            message: "Cannot complete patient"
        });
    }
};


export const skipPatient = async (req, res) => {
    try {
        const { queueId, visitId } = req.params;

        // 1. Queue find karo
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // 2. Hospital isolation
        if (
            req.user.role !== "PLATFORM_ADMIN" &&
            (
                !req.user.hospitalId ||
                queue.hospitalId.toString() !==
                req.user.hospitalId.toString()
            )
        ) {
            return res.status(403).json({
                message: "You are not authorized to access this queue"
            });
        }

        // 3. Visit find karo
        const visit = await Visit.findById(visitId);

        if (!visit) {
            return res.status(404).json({
                message: "Visit not found"
            });
        }

        // 4. Check visit isi queue ki hai
        if (visit.queueId.toString() !== queueId.toString()) {
            return res.status(403).json({
                message: "Visit does not belong to this queue"
            });
        }

        // 5. Sirf IN_SERVICE patient skip ho sakta hai
        if (visit.status !== "IN_SERVICE") {
            return res.status(400).json({
                message: "Only an in-service visit can be skipped"
            });
        }

        // 6. Skip patient
        visit.status = "SKIPPED";
        visit.skippedAt = new Date();

        await visit.save();

        return res.status(200).json({
            message: "Patient skipped successfully",
            visit
        });

    } catch (error) {
        console.error("Skip patient error:", error);

        return res.status(500).json({
            message: "Cannot skip patient"
        });
    }
};