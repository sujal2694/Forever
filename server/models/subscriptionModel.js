import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
    },
    email : {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active'
    }
});

export const subscriptionModel = mongoose.models.subscription || mongoose.model('Subscription', subscriptionSchema);