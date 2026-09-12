import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js';
import { userRouter } from './routes/userRoutes.js';
import addressRouter from './routes/addressRoute.js';
import { cartRouter } from './routes/cartRoutes.js';
import { productRouter } from './routes/productRoutes.js';
import { orderRouter } from './routes/orderRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { subscriptionRouter } from './routes/subscriptionRoutes.js';

const app = express();

app.use(express.json())
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
}));

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
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/subscription', subscriptionRouter);

app.get('/', (req, res) => {
    res.send("server is live....")
})


const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})

