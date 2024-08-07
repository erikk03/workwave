import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
},
{ timestamps: true }

);

const User = models.User || mongoose.model("User", userSchema);

export default User;