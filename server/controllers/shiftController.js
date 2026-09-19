import Shift from "../models/Shift.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";

export const createShift = async (req, res) => {
    try {
        const {
            doctorId,
            name,
            date,
            startTime,
            endTime
        } = req.body;

        if (!doctorId || !name || !date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Doctor, name, date, startTime and endTime are required"
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

        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        if (doctor.hospitalId.toString() !== hospitalId.toString()) {
            return res.status(403).json({
                message: "Doctor does not belong to this hospital"
            });
        }

        const shift = await Shift.create({
            hospitalId,
            doctorId,
            name,
            date,
            startTime,
            endTime
        });

        return res.status(201).json({
            message: "Shift created successfully",
            shift
        });

    } catch (error) {
        console.error("Create shift error:", error);

        return res.status(500).json({
            message: "Cannot create shift"
        });
    }
};



export const getShifts = async (req, res) => {
    try {
        let shifts;

        if (req.user.role === "PLATFORM_ADMIN") {
            shifts = await Shift.find()
                .populate("hospitalId", "name")
                .populate("doctorId", "name specialization");
        } else {
            const hospitalId = req.user.hospitalId;

            if (!hospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }

            shifts = await Shift.find({
                hospitalId
            })
                .populate("doctorId", "name specialization");
        }

        return res.status(200).json({
            message: "Shifts fetched successfully",
            shifts
        });

    } catch (error) {
        console.error("Get shifts error:", error);

        return res.status(500).json({
            message: "Cannot fetch shifts"
        });
    }
};



export const getShiftById = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await Shift.findById(id)
            .populate("hospitalId", "name")
            .populate("doctorId", "name specialization");

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
                if (!req.user.hospitalId) {
                return res.status(403).json({
                    message: "User is not associated with any hospital"
                });
            }
            if (
                shift.hospitalId._id.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to access this shift"
                });
            }
        }

        return res.status(200).json({
            message: "Shift fetched successfully",
            shift
        });

    } catch (error) {
        console.error("Get shift error:", error);

        return res.status(500).json({
            message: "Cannot fetch shift"
        });
    }
};


export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            date,
            startTime,
            endTime,
            status
        } = req.body;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
                if (!req.user.hospitalId) {
                return res.status(403).json({
                    message: "User is not associated with any hospital"
                });
            }
            if (
                shift.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to update this shift"
                });
            }
        }

        if (name !== undefined) {
            shift.name = name;
        }

        if (date !== undefined) {
            shift.date = date;
        }

        if (startTime !== undefined) {
            shift.startTime = startTime;
        }

        if (endTime !== undefined) {
            shift.endTime = endTime;
        }

        if (status !== undefined) {
            shift.status = status;
        }

        await shift.save();

        return res.status(200).json({
            message: "Shift updated successfully",
            shift
        });

    } catch (error) {
        console.error("Update shift error:", error);

        return res.status(500).json({
            message: "Cannot update shift"
        });
    }
};






export const openShift = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                shift.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to open this shift"
                });
            }
        }

        if (shift.status === "OPEN") {
            return res.status(400).json({
                message: "Shift is already open"
            });
        }

        if (shift.status === "CLOSED") {
            return res.status(400).json({
                message: "Closed shift cannot be opened again"
            });
        }

        shift.status = "OPEN";
        shift.openedAt = new Date();

        await shift.save();

        return res.status(200).json({
            message: "Shift opened successfully",
            shift
        });

    } catch (error) {
        console.error("Open shift error:", error);

        return res.status(500).json({
            message: "Cannot open shift"
        });
    }
};


export const closeShift = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                shift.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to close this shift"
                });
            }
        }

        if (shift.status === "CLOSED") {
            return res.status(400).json({
                message: "Shift is already closed"
            });
        }

        if (shift.status !== "OPEN") {
            return res.status(400).json({
                message: "Only an open shift can be closed"
            });
        }

        shift.status = "CLOSED";
        shift.closedAt = new Date();

        await shift.save();

        return res.status(200).json({
            message: "Shift closed successfully",
            shift
        });

    } catch (error) {
        console.error("Close shift error:", error);

        return res.status(500).json({
            message: "Cannot close shift"
        });
    }
};