import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

export const createSchedule = async (req, res) => {
    try {
        const {
            doctorId,
            name,
            daysOfWeek,
            startTime,
            endTime,
            hospitalId
        } = req.body;

        // 1. Required fields validate karo
        if (
            !doctorId ||
            !name ||
            !daysOfWeek ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                message:
                    "Doctor, name, daysOfWeek, startTime and endTime are required"
            });
        }

        // 2. Hospital determine karo
        let targetHospitalId;

        if (req.user.role === "PLATFORM_ADMIN") {
            targetHospitalId = hospitalId;

            if (!targetHospitalId) {
                return res.status(400).json({
                    message: "hospitalId is required"
                });
            }
        } else {
            targetHospitalId = req.user.hospitalId;

            if (!targetHospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }
        }

        // 3. Hospital verify karo
        const hospital = await Hospital.findById(targetHospitalId);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        // 4. Doctor verify karo
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // 5. Doctor isi hospital ka hona chahiye
        if (
            doctor.hospitalId.toString() !==
            targetHospitalId.toString()
        ) {
            return res.status(403).json({
                message:
                    "Doctor does not belong to this hospital"
            });
        }

        // 6. Schedule create karo
        const schedule = await Schedule.create({
            hospitalId: targetHospitalId,
            doctorId,
            name,
            daysOfWeek,
            startTime,
            endTime
        });

        return res.status(201).json({
            message: "Schedule created successfully",
            schedule
        });

    } catch (error) {
        console.error("Create schedule error:", error);

        return res.status(500).json({
            message: "Cannot create schedule"
        });
    }
};



export const getSchedules = async (req, res) => {
    try {
        let schedules;

        if (req.user.role === "PLATFORM_ADMIN") {
            schedules = await Schedule.find()
                .populate("hospitalId", "name")
                .populate("doctorId", "name specialization");
        } else {
            schedules = await Schedule.find({
                hospitalId: req.user.hospitalId
            })
                .populate("hospitalId", "name")
                .populate("doctorId", "name specialization");
        }

        return res.status(200).json({
            schedules
        });

    } catch (error) {
        console.error("Get schedules error:", error);

        return res.status(500).json({
            message: "Cannot get schedules"
        });
    }
};

export const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findById(id)
            .populate("hospitalId", "name")
            .populate("doctorId", "name specialization");

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        // Platform Admin kisi bhi hospital ka schedule dekh sakta hai
        if (req.user.role === "PLATFORM_ADMIN") {
            return res.status(200).json({
                schedule
            });
        }

        // Hospital users sirf apne hospital ka schedule dekh sakte hain
        if (
            schedule.hospitalId._id.toString() !==
            req.user.hospitalId.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this schedule"
            });
        }

        return res.status(200).json({
            schedule
        });

    } catch (error) {
        console.error("Get schedule by ID error:", error);

        return res.status(500).json({
            message: "Cannot get schedule"
        });
    }
};


export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            daysOfWeek,
            startTime,
            endTime
        } = req.body;

        // 1. Schedule find karo
        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        // 2. Hospital ownership check
        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                schedule.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to update this schedule"
                });
            }
        }

        // 3. Jo fields di gayi hain sirf unko update karo
        if (name !== undefined) {
            schedule.name = name;
        }

        if (daysOfWeek !== undefined) {
            schedule.daysOfWeek = daysOfWeek;
        }

        if (startTime !== undefined) {
            schedule.startTime = startTime;
        }

        if (endTime !== undefined) {
            schedule.endTime = endTime;
        }

        await schedule.save();

        return res.status(200).json({
            message: "Schedule updated successfully",
            schedule
        });

    } catch (error) {
        console.error("Update schedule error:", error);

        return res.status(500).json({
            message: "Cannot update schedule"
        });
    }
};



export const deactivateSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        // Hospital Admin sirf apne hospital ka schedule
        // deactivate kar sakta hai
        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                schedule.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to deactivate this schedule"
                });
            }
        }

        if (!schedule.isActive) {
            return res.status(400).json({
                message: "Schedule is already inactive"
            });
        }

        schedule.isActive = false;

        await schedule.save();

        return res.status(200).json({
            message: "Schedule deactivated successfully",
            schedule
        });

    } catch (error) {
        console.error("Deactivate schedule error:", error);

        return res.status(500).json({
            message: "Cannot deactivate schedule"
        });
    }
};


export const activateSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                schedule.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to activate this schedule"
                });
            }
        }

        if (schedule.isActive) {
            return res.status(400).json({
                message: "Schedule is already active"
            });
        }

        schedule.isActive = true;

        await schedule.save();

        return res.status(200).json({
            message: "Schedule activated successfully",
            schedule
        });

    } catch (error) {
        console.error("Activate schedule error:", error);

        return res.status(500).json({
            message: "Cannot activate schedule"
        });
    }
};