import mongoose, { Schema, models } from "mongoose";

const ListingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String, required: true }],
    location: { type: String, required: true },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract"], required: true },
    salary: { type: String, required: true },
    company: { type: String, required: true },
    postedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
    notifications: { type: [Schema.Types.ObjectId], ref: "Notification", default: [] },
    isActive: { type: Boolean, default: true }, // Listing status
    isAccepted: { type: Boolean, default: false }, // New field to track if the listing has been accepted
    acceptedUser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

export const Listing = models.Listing || mongoose.model("Listing", ListingSchema);



