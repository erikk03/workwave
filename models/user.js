import mongoose, { Schema } from 'mongoose';

// Define your user schema
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    position: {type: String, default: ''},
    industry: { type: String, default: ''},
    experience: { type: String, default: ''},
    education: { type: String, default: ''},
    skills: { type: String, default: ''},
    cv: { type: String, default: null }, // Field for storing the CV file path or URL
    isAdmin: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibilitySettings: {
        firstName: { type: Boolean, default: true },
        lastName: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        phone: { type: Boolean, default: true },
        profileImage: { type: Boolean, default: true },
        position: { type: Boolean, default: true },
        industry: { type: Boolean, default: true },
        experience: { type: Boolean, default: true },
        education: { type: Boolean, default: true },
        skills: { type: Boolean, default: true },
        cv: { type: Boolean, default: true },
    },
}, { timestamps: true });

// Ensure only one instance of the model is created
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
