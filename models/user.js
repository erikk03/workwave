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
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ensure only one instance of the model is created
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
