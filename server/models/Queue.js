import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
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

        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            required: true
        },

        date: {
            type: Date,
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

export default mongoose.model("Queue", queueSchema);