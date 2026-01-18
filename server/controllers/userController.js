import jwt from 'jsonwebtoken'
import { useModel } from '../models/userSchema';
import validator from 'validator'


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

export const registerUser = async (req, res) => {
    const { email, paasword } = req.body;
    try {
        const exists = useModel.findOne({email});
        if (exists) {
            res.json({success: false, message: "User already exists."})
        }

        //validating email
        if (validator.isEmail(email)) {
            res.json({success:false, message: "Email is incorrect."})
        }

        

    } catch (error) {
        res.json({success:false, message: "error"})
        console.log(error);
    }
}