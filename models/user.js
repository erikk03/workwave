// import mongoose, { Schema, models } from "mongoose";

// const userSchema = new Schema({
//     FirstName: {
//         type: String,
//         required: true
//     },
//     LastName: {
//         type: String,
//         required: true
//     },
//     Email: {
//         type: String,
//         required: true
//     },
//     Phone: {
//         type: String,
//         required: true
//     },
//     Password: {
//         type: String,
//         required: true
//     },
// },
// { timestamps: true }

// );

// const User = models.User || mongoose.model("User", userSchema);

// export default User;

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
        required: true,
        unique: true
    },
    Phone: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    ProfileImage: {
        type: String, // URL of the profile image stored in Azure Blob Storage
        default: null // Default value if no image is uploaded
    },
}, 
{ 
    timestamps: true 
});

const User = models.User || mongoose.model("User", userSchema);

export default User;
