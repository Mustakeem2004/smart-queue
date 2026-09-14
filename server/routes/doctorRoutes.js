import express from 'express'
import { handleNext,getQueue,skipPatient ,getQueueStats } from '../controllers/doctorController.js';
const router=express.Router();



router.post("/next",handleNext);
router.get("/queue",getQueue );
router.post("/skip",skipPatient );
router.get("/stats",getQueueStats );

export default router
