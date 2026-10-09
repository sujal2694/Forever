import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import { connectDB } from './config/db.js';
import { userRouter } from './routes/userRoutes.js';
import addressRouter from './routes/addressRoute.js';
import { cartRouter } from './routes/cartRoutes.js';
import { productRouter } from './routes/productRoutes.js';
import { orderRouter } from './routes/orderRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { subscriptionRouter } from './routes/subscriptionRoutes.js';
import { stripeWebhook } from './controllers/orderController.js';
import { sendError } from './utils/response.js';
import { UPLOADS_DIR } from './utils/uploadStorage.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error("Origin is not allowed by CORS");
        error.status = 403;
        return callback(error);
    },
}));

app.post("/api/order/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
    req.body ??= {};
    next();
});

// api endpoints
app.use("/api/product", productRouter);
app.use("/images", express.static(UPLOADS_DIR));
app.use('/api/user', userRouter);
app.use('/api/address', addressRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/subscription', subscriptionRouter);

app.get('/', (req, res) => {
    res.send("server is live....")
})

app.use((req, res) => sendError(res, "Not found", 404));
app.use((error, req, res, next) => {
    console.error("Unhandled request error:", error);
    if (res.headersSent) return next(error);

    const status = error.status === 413 || error.type === "entity.too.large"
        ? 413
        : error.status === 403
            ? 403
            : error.code?.startsWith("LIMIT_")
                ? 400
                : 500;
    const message = status === 413
        ? "Request body is too large"
        : status === 403
            ? "Request origin is not allowed"
            : status === 400
                ? "Invalid upload request"
                : "Internal server error";
    return sendError(res, message, status);
});

const startServer = async () => {
    const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    if (Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
        throw new Error("JWT_SECRET must be at least 32 bytes long.");
    }

    await connectDB();
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`server running on port ${port}`));
};

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});
