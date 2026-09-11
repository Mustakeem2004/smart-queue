import Patient from "../models/Patient.js";


export const handleJoin = async (req,res) =>{
    try{
        
        
        const {name} = req.body;
        let lastPatient = await Patient.findOne().sort({token:-1});
        let newToken=1;
        if(lastPatient){
            newToken=lastPatient.token+1;
        }

        const patient = await Patient.create({
            token: newToken,
            name: name,
        }) 


        res.status(201).json({
            patient
        })

    }
    catch(e){
        res.status(500).json({message:"Cannot Join the queue please try again"})
    }

}





export const getPatientInfo = async (req,res)=>{
    try{
        const userToken= Number(req.params.token);
        const patient = await Patient.findOne({token: userToken});
        if (!patient) {
            return res.status(404).json({
            message: "Patient not found"
        });
        }

        const peopleAhead = await Patient.countDocuments({
            status: "WAITING",
            token: { $lt: userToken }
        });

        


        res.json({
         token: patient.token,
         name: patient.name,
         status: patient.status,
         currentToken: 0,
         peopleAhead: peopleAhead
        });


    }
    catch(e){
        res.status(500).json({message:"Cannot get the user Info"})
    }

}






export const cancelPatient= async(req,res) =>{
    try{
        const userToken = Number(req.params.token);
        const patient=await  Patient.findOne({ token: userToken })
        if(!patient){            
            return res.status(404).json({message:"user not found"});
        }
        if(patient.status === 'WAITING'){
            patient.status="CANCELLED"
            await patient.save();
        }
        else{
            return res.status(400).json({message:"user cannot be cancelled"});
        }

        res.json({patient});
    }
        catch(error){
        res.status(500).json({message:"Cannot get the Patients"})
    }
}

