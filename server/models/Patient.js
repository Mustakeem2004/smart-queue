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
            enum: ["WAITING","IN_SERVICE","COMPLETED","CANCELLED"],
            default: "WAITING"
        }

})

export default mongoose.model("Patient",patientSchema)
