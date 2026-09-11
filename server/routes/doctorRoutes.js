import express from 'express'
import { handleNext,getQueue  } from '../controllers/doctorController.js';
const router=express.Router();



router.post("/next",handleNext);
router.get("/queue",getQueue );

export default router
