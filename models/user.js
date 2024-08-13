import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String, // URL of the profile image stored in Azure Blob Storage
        default: null // Default value if no image is uploaded
    },
}, 
{ 
    timestamps: true 
});

const User = models.User || mongoose.model("User", userSchema);

export default User;
