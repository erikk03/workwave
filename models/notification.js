import mongoose, {Schema, models} from "mongoose";

const NotificationSchema = new Schema({
    type: { type: String, enum: ["like", "comment", "application"], required: true },
    userId: { type: String, required: true },
    userFirstName: { type: String, required: true },
    userLastName: { type: String, required: true },
    postId: {type: String}, // Optional, only for post notifications
    comment: { type: String }, // Optional, only for comment notifications
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

export const Notification = models.Notification || mongoose.model("Notification", NotificationSchema);
