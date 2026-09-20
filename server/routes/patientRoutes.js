import express from 'express';
import { createPatient,
         cancelVisit

} from "../controllers/patientController.js"

const router = express.Router();

router.post('/',createPatient)
router.patch(
    "/visit/:trackingId/cancel",
    cancelVisit
);
// router.post('/join',handleJoin);
// router.get('/info/:token',getPatientInfo);
// router.post('/cancel/:token',cancelPatient);


export default router;



