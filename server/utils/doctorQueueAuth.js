import crypto from "crypto";
import Queue from "../models/Queue.js";

export const verifyDoctorQueueToken = async (token) => {
    if (!token) {
        return null;
    }

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const queue = await Queue.findOne({
        doctorAccessTokenHash: tokenHash
    });

    return queue;
};