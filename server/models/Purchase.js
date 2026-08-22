import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }

}, { timestamps: true });

PurchaseSchema.index({ userId: 1, courseId: 1 });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);