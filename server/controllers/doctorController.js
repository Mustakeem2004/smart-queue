import Patient from "../models/Patient.js";


export const handleNext = async (req,res) =>{
    try{
        const patient = await Patient.findOne({status: "IN_SERVICE"});
        if(patient){
            patient.status="COMPLETED";
            await patient.save();
        }

        const patient2 = await Patient.findOne({status: "WAITING"}).sort({token: 1})
        if(!patient2){
            return res.status(400).json({message:"No waiting patient found"});
        }
        patient2.status="IN_SERVICE";
        await patient2.save();

        return res.status(200).json({
            patient2
        })

    }
    catch(e){
        return res.status(500).json({message: "Error cannot do next"})
        
    }
}


export const getQueue = async (req,res) =>{
    try{
        const patients = await Patient.find();
        res.json(patients);
    }
    catch(error){
        res.status(500).json({message:"Cannot get the Patients"})
    }

}