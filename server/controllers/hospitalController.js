import Hospital from "../models/Hospital.js";



export const createHospital = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;

        if (!name || !address || !phone) {
            return res.status(400).json({
                message: "Name, address and phone are required"
            });
        }

        const hospital = await Hospital.create({
            name,
            address,
            phone,
            email
        });

        return res.status(201).json({
            message: "Hospital created successfully",
            hospital
        });

    } catch (error) {
        console.error("Create hospital error:", error);

        return res.status(500).json({
            message: "Cannot create hospital"
        });
    }
};