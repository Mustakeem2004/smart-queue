import Queue from "../models/Queue.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";
import Shift from "../models/Shift.js";
import crypto from "crypto";
import Visit from "../models/Visit.js";
import Patient from "../models/Patient.js";

export const createQueue = async (req, res) => {
  try {
    const { doctorId, shiftId, date } = req.body;

    if (!doctorId || !shiftId || !date) {
      return res.status(400).json({
        message: "Doctor, shift and date are required",
      });
    }

    let hospitalId;

    if (req.user.role === "PLATFORM_ADMIN") {
      hospitalId = req.body.hospitalId;

      if (!hospitalId) {
        return res.status(400).json({
          message: "hospitalId is required",
        });
      }
    } else {
      hospitalId = req.user.hospitalId;

      if (!hospitalId) {
        return res.status(400).json({
          message: "Hospital information missing",
        });
      }
    }

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (doctor.hospitalId.toString() !== hospitalId.toString()) {
      return res.status(403).json({
        message: "Doctor does not belong to this hospital",
      });
    }

    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    if (shift.hospitalId.toString() !== hospitalId.toString()) {
      return res.status(403).json({
        message: "Shift does not belong to this hospital",
      });
    }

    if (shift.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        message: "Shift does not belong to this doctor",
      });
    }

    if (shift.status !== "OPEN") {
      return res.status(400).json({
        message: "Shift must be open to create a queue",
      });
    }

    const existingQueue = await Queue.findOne({
      hospitalId,
      doctorId,
      shiftId,
      date,
    });

    if (existingQueue) {
      return res.status(409).json({
        message: "Queue already exists for this doctor, shift and date",
      });
    }

    const queue = await Queue.create({
      hospitalId,
      doctorId,
      shiftId,
      date,
      status: "OPEN",
      openedAt: new Date(),
    });

    const queueDate = new Date(date);
    const shiftDate = new Date(shift.date);

    if (
      queueDate.toISOString().split("T")[0] !==
      shiftDate.toISOString().split("T")[0]
    ) {
      return res.status(400).json({
        message: "Queue date must match shift date",
      });
    }

    return res.status(201).json({
      message: "Queue created successfully",
      queue,
    });
  } catch (error) {
    console.error("Create queue error:", error);

    return res.status(500).json({
      message: "Cannot create queue",
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
        .populate("shiftId", "name startTime endTime date");
    } else {
      const hospitalId = req.user.hospitalId;

      if (!hospitalId) {
        return res.status(400).json({
          message: "Hospital information missing",
        });
      }

      queues = await Queue.find({
        hospitalId,
      })
        .populate("doctorId", "name specialization")
        .populate("shiftId", "name startTime endTime date");
    }

    return res.status(200).json({
      message: "Queues fetched successfully",
      queues,
    });
  } catch (error) {
    console.error("Get queues error:", error);

    return res.status(500).json({
      message: "Cannot fetch queues",
    });
  }
};




export const getQueueById = async (req, res) => {
  try {
    const { id } = req.params;

    const queue = await Queue.findById(id)
      .populate("hospitalId", "name")
      .populate("doctorId", "name specialization")
      .populate("shiftId", "name startTime endTime date");

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    if (req.user.role !== "PLATFORM_ADMIN") {
      if (queue.hospitalId._id.toString() !== req.user.hospitalId.toString()) {
        return res.status(403).json({
          message: "You are not authorized to access this queue",
        });
      }
    }

    return res.status(200).json({
      message: "Queue fetched successfully",
      queue,
    });
  } catch (error) {
    console.error("Get queue error:", error);

    return res.status(500).json({
      message: "Cannot fetch queue",
    });
  }
};






export const closeQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const queue = await Queue.findById(id);

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    if (req.user.role !== "PLATFORM_ADMIN") {
      if (queue.hospitalId.toString() !== req.user.hospitalId.toString()) {
        return res.status(403).json({
          message: "You are not authorized to close this queue",
        });
      }
    }

    if (queue.status === "CLOSED") {
      return res.status(400).json({
        message: "Queue is already closed",
      });
    }

    if (queue.status !== "OPEN") {
      return res.status(400).json({
        message: "Only an open queue can be closed",
      });
    }

    queue.status = "CLOSED";
    queue.closedAt = new Date();

    await queue.save();

    return res.status(200).json({
      message: "Queue closed successfully",
      queue,
    });
  } catch (error) {
    console.error("Close queue error:", error);

    return res.status(500).json({
      message: "Cannot close queue",
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
            shiftId: queue.shiftId,
            token,
            trackingId,
            status: "WAITING"
        });

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