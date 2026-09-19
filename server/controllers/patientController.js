import Patient from "../models/Patient.js";

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
