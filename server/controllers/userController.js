import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js';
import validator from 'validator'
import bcrypt from 'bcrypt'


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const exists = userModel.findOne(email);
        if (exists) {
            return res.json({ success: false, message: "User already exists." })
        }

        //validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Email is incorrect." })
        }

        if (password.length < 8) {
            return res.json({success:false, message:'Paaword is weak, Make strong & use atleast 8 charachters.'})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save();
        const token = createToken(user._id)
        res.json({success:true, token})



    } catch (error) {
        res.json({ success: false, message: "error" })
        console.log(error);
    }
}

export const loginUser = async (req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({success:false,message:"User doesn't exists"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch) {
            return res,json({success:false,message:"Invalid credentials"})
        }
        
        const token = createToken(user._id);
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}