import mongoose, { Schema, models } from "mongoose";

const ApplicationSchema = new Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true }, // Reference to the listing
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who applied
    resume: { type: String, default: null }, // Path to the resume file or URL
    status: { type: String, enum: ["Pending", "Accepted", "Denied"], default: "Pending" }, // Status of the application
    createdAt: { type: Date, default: Date.now }, // Application creation date
}, {
    timestamps: true,
});

export const Application = models.Application || mongoose.model("Application", ApplicationSchema);
