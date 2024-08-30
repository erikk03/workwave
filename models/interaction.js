// models/interaction.js
import mongoose, { Schema } from 'mongoose';

const interactionSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    interaction: { type: Number, default: 0 }, // Use 1 for interaction; you might use different scales if needed
}, { timestamps: true });

const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);

export default Interaction;
