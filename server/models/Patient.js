import mongoose from "mongoose";


const patientSchema = new  mongoose.Schema(
    {
        token: {
            type: Number
        },
        name: {
            type: String
        },
        status:{
            type: String,
            enum: ["WAITING","IN_SERVICE","COMPLETED","CANCELLED","SKIPPED"],
            default: "WAITING"
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
        skippedAt:{
            type: Date
        }


        },
        {
            timestamps:true,
        }
    )

export default mongoose.model("Patient",patientSchema)
