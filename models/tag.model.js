import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


export default mongoose.model('Tag', tagSchema);