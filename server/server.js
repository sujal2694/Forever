import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js';
import { userRouter } from './routes/userRoutes.js';
import addressRouter from './routes/addressRoute.js';
import { cartRouter } from './routes/cartRoutes.js';
import { productRouter } from './routes/productRoutes.js';

const app = express();

app.use(express.json())
app.use(cors())

// database connection
connectDB().catch((err) => {
    console.error("Failed to connect to DB:", err.message);
});

// api endpoints
app.use("/api/product", productRouter);
app.use("/images", express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/address', addressRouter);
app.use('/api/cart', cartRouter);

app.get('/', (req, res) => {
    res.send("server is live....")
})


const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})

