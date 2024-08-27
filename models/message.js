import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        firstName: {type: String, required: true },
        lastName: {type: String, required: true },
        userImage: {type: String },
    },
    recipient: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        firstName: {type: String, required: true },
        lastName: {type: String, required: true },
        userImage: {type: String },
    },
    message: { type: String, required: true },
    attachments: [{ type: String }], // Array of attachment URLs (optional)
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;