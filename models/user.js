// import mongoose, { Schema, models } from "mongoose";

// const userSchema = new Schema({
//     firstName: {
//         type: String,
//         required: true
//     },
//     lastName: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     phone: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     profileImage: {
//         type: String, // URL of the profile image stored in Azure Blob Storage
//         default: null // Default value if no image is uploaded
//     },
//     isAdmin: {
//         type: Boolean,
//         default: false // Add this field to indicate admin status
//     },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

//     pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
// }, 
// { 
//     timestamps: true 
// });

// const User = models.User || mongoose.model("User", userSchema);

// export default User;


import mongoose, { Schema } from 'mongoose';

// Define your user schema
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ensure only one instance of the model is created
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
