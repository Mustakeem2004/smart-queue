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

        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["OPEN", "CLOSED"],
            default: "OPEN"
        },

        openedAt: {
            type: Date,
            default: Date.now
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