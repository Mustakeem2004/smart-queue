import express from 'express';
import {handleJoin,getPatientInfo,cancelPatient} from "../controllers/patientController.js"

const router = express.Router();


router.post('/join',handleJoin);
router.get('/info/:token',getPatientInfo);
router.post('/cancel/:token',cancelPatient);


export default router;



