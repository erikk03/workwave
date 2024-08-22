import mongoose, { Schema, models } from "mongoose";

const ListingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String, required: true }], // Array of required skills
    location: { type: String, required: true },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract"], required: true },
    salary: { type: String, required: true }, // Salary information
    company: { type: String, required: true }, // Company offering the job
    postedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who posted the listing
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // Array of applications
    isActive: { type: Boolean, default: true }, // Listing status
    createdAt: { type: Date, default: Date.now }, // Listing creation date
}, {
    timestamps: true,
});

export const Listing = models.Listing || mongoose.model("Listing", ListingSchema);
