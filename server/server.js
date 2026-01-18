import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js';

const app = express();


app.use(express.json())
app.use(cors())

//database connection
connectDB();


app.get('/',(req,res)=>{
    res.send("server is live....")
})

const port = process.env.PORT || 4000
app.listen(port,(req,res)=>{
    console.log("server running on port 4000");
})