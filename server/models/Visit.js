import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

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

        queueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Queue",
            required: true
        },

        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            required: true
        },

        token: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: ["NORMAL", "URGENT", "EMERGENCY"],
            default: "NORMAL"
        },

        source: {
            type: String,
            enum: ["WALK_IN", "CALL", "APPOINTMENT"],
            default: "WALK_IN"
        },

        status: {
            type: String,
            enum: [
                "WAITING",
                "IN_SERVICE",
                "COMPLETED",
                "CANCELLED",
                "NO_SHOW"
            ],
            default: "WAITING"
        },

        trackingId: {
            type: String,
            required: true,
            unique: true
        },

        joinedAt: {
            type: Date,
            default: Date.now
        },

        serviceStartedAt: {
            type: Date
        },

        completedAt: {
            type: Date
        },

        cancelledAt: {
            type: Date
        },

        skippedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Visit", visitSchema);