// models/interaction.js
import mongoose, { Schema } from 'mongoose';

const PostInteractionSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    interaction: { type: Number, default: 0 },
}, { timestamps: true });

const PostInteraction = mongoose.models.PostInteraction || mongoose.model('PostInteraction', PostInteractionSchema);

export default PostInteraction;
