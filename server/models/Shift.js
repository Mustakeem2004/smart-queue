import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["SCHEDULED", "OPEN", "CLOSED"],
            default: "SCHEDULED"
        },

        openedAt: {
            type: Date
        },

        closedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Shift", shiftSchema);