import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

export const createDoctor = async (req, res) => {
    try {
        const {
            name,
            specialization,
            roomNumber,
            consultationTime,
            hospitalId,
        } = req.body;

        if (!name || !specialization) {
            return res.status(400).json({
                message: "Name and specialization are required"
            });
        }

        let singleHospitalId;

        if (req.user.role === "PLATFORM_ADMIN") {
            singleHospitalId = hospitalId;

            if (!singleHospitalId) {
                return res.status(400).json({
                    message: "hospitalId is required"
                });
            }
        } else {
            singleHospitalId = req.user.hospitalId;
            if (!singleHospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }
        }

        const hospital = await Hospital.findById(singleHospitalId);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        const doctor = await Doctor.create({
            name,
            specialization,
            hospitalId: singleHospitalId,
            roomNumber,
            consultationTime
        });

        return res.status(201).json({
            message: "Doctor created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create doctor error:", error);

        return res.status(500).json({
            message: "Cannot create doctor"
        });
    }
};



export const getDoctors = async (req, res) => {
    try {
        let doctors;

        if (req.user.role === "PLATFORM_ADMIN") {
            doctors = await Doctor.find()
                .populate("hospitalId", "name");
        } else {
            const hospitalId = req.user.hospitalId;

            if (!hospitalId) {
                return res.status(400).json({
                    message: "Hospital information missing"
                });
            }

            doctors = await Doctor.find({
                hospitalId
            });
        }

        return res.status(200).json({
            message: "Doctors fetched successfully",
            doctors
        });

    } catch (error) {
        console.error("Get doctors error:", error);

        return res.status(500).json({
            message: "Cannot fetch doctors"
        });
    }
};



export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                doctor.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to access this doctor"
                });
            }
        }

        return res.status(200).json({
            message: "Doctor fetched successfully",
            doctor
        });

    } catch (error) {
        console.error("Get doctor error:", error);

        return res.status(500).json({
            message: "Cannot fetch doctor"
        });
    }
};




export const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            specialization,
            roomNumber,
            consultationTime,
            isActive
        } = req.body;

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                doctor.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to update this doctor"
                });
            }
        }

        if (name !== undefined) {
            doctor.name = name;
        }

        if (specialization !== undefined) {
            doctor.specialization = specialization;
        }

        if (roomNumber !== undefined) {
            doctor.roomNumber = roomNumber;
        }

        if (consultationTime !== undefined) {
            doctor.consultationTime = consultationTime;
        }

        if (isActive !== undefined) {
            doctor.isActive = isActive;
        }

        await doctor.save();

        return res.status(200).json({
            message: "Doctor updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update doctor error:", error);

        return res.status(500).json({
            message: "Cannot update doctor"
        });
    }
};




export const deactivateDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        if (req.user.role !== "PLATFORM_ADMIN") {
            if (
                doctor.hospitalId.toString() !==
                req.user.hospitalId.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to deactivate this doctor"
                });
            }
        }

        doctor.isActive = false;

        await doctor.save();

        return res.status(200).json({
            message: "Doctor deactivated successfully",
            doctor
        });

    } catch (error) {
        console.error("Deactivate doctor error:", error);

        return res.status(500).json({
            message: "Cannot deactivate doctor"
        });
    }
};