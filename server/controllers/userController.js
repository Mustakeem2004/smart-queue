import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createUser = async (req,res) =>{
    try{
        const {name,email,password,role,hospitalId} = req.body;
                if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        // 2. Check whether user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            passwordHash,
            role,
            hospitalId: hospitalId || null
        });
                return res.status(201).json({
            message: "User created successfully",
            user
        });

    }
    catch(error){
        console.error("Create user error:", error);
        return res.status(500).json({
            message: "Cannot create user"
        });
        
    }
}