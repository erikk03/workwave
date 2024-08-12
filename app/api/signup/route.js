
///////////////////////////////////////////////////////////////////////////////////
// NO IMAGE

// import { connectMongoDB } from "@/lib/mongodb";
// import { NextResponse } from "next/server";
// import User from "@/models/user";
// import bcrypt from "bcryptjs";

// export async function POST(req) {
//     try {
//         const {FirstName, LastName, Email, Phone, Password, ConfirmPassword} = await req.json();
//         const hashedPassword = await bcrypt.hash(Password, 10);
        
//         await connectMongoDB();
//         await User.create({
//             FirstName,
//             LastName,
//             Email,
//             Phone,
//             Password: hashedPassword
//         })

//         return NextResponse.json(
//             {message: "User Signed up successfully"},
//             {status: 201}
//         );
//     } catch (error) {
//         return NextResponse.json(
//             {message: "Error while signing up"},
//             {status: 500}
//         );
//     }
// }

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//  IMAGE NO LOG

// import { connectMongoDB } from "@/lib/mongodb";
// import { NextResponse } from "next/server";
// import User from "@/models/user";
// import bcrypt from "bcryptjs";
// import { BlobServiceClient } from '@azure/storage-blob';
// import crypto from 'crypto';

// const accountName = process.env.ACCOUNT_NAME;
// const containerName = process.env.CONTAINER_NAME;
// const sasToken = process.env.SAS_TOKEN;

// const blobServiceClient = new BlobServiceClient(
//     `https://${accountName}.blob.core.windows.net?${sasToken}`
// );
// const containerClient = blobServiceClient.getContainerClient(containerName);

// export async function POST(req) {
//     try {
//         const formData = await req.formData();
//         const FirstName = formData.get('FirstName');
//         const LastName = formData.get('LastName');
//         const Email = formData.get('Email');
//         const Phone = formData.get('Phone');
//         const Password = formData.get('Password');
//         const ConfirmPassword = formData.get('ConfirmPassword');
//         const profileImage = formData.get('ProfileImage');

//         if (profileImage) {
//             const blobName = crypto.randomBytes(16).toString("hex") + '-' + profileImage.name;
//             const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//             await blockBlobClient.upload(profileImage.stream(), profileImage.size);
//             var imageUrl = blockBlobClient.url;
//         } else {
//             var imageUrl = null;
//         }

//         const hashedPassword = await bcrypt.hash(Password, 10);
        
//         await connectMongoDB();
//         await User.create({
//             FirstName,
//             LastName,
//             Email,
//             Phone,
//             Password: hashedPassword,
//             ProfileImage: imageUrl
//         });

//         return NextResponse.json(
//             { message: "User signed up successfully" },
//             { status: 201 }
//         );
//     } catch (error) {
//         return NextResponse.json(
//             { message: "Error while signing up" },
//             { status: 500 }
//         );
//     }
// }

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//  IMAGE  LOG

// import { connectMongoDB } from "@/lib/mongodb";
// import { NextResponse } from "next/server";
// import User from "@/models/user";
// import bcrypt from "bcryptjs";
// import { BlobServiceClient } from '@azure/storage-blob';
// import crypto from 'crypto';

// const accountName = process.env.ACCOUNT_NAME;
// const containerName = process.env.CONTAINER_NAME;
// const sasToken = process.env.SAS_TOKEN;

// const blobServiceClient = new BlobServiceClient(
//     `https://${accountName}.blob.core.windows.net?${sasToken}`
// );
// const containerClient = blobServiceClient.getContainerClient(containerName);

// export async function POST(req) {
//     try {
//         const formData = await req.formData();
//         const FirstName = formData.get('FirstName');
//         const LastName = formData.get('LastName');
//         const Email = formData.get('Email');
//         const Phone = formData.get('Phone');
//         const Password = formData.get('Password');
//         const ConfirmPassword = formData.get('ConfirmPassword');
//         const profileImage = formData.get('ProfileImage');

//         if (!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
//             return NextResponse.json(
//                 { message: "All fields are required" },
//                 { status: 400 }
//             );
//         }

//         // Check if profileImage is provided
//         let imageUrl = null;
//         if (profileImage && profileImage.size > 0) {
//             const blobName = crypto.randomBytes(16).toString("hex") + '-' + profileImage.name;
//             const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//             try {
//                 await blockBlobClient.uploadData(profileImage.stream(), {
//                     blobHTTPHeaders: { blobContentType: profileImage.type }
//                 });
//                 imageUrl = blockBlobClient.url;
//             } catch (uploadError) {
//                 console.error("Error uploading image to Azure Blob Storage:", uploadError);
//                 return NextResponse.json(
//                     { message: "Error uploading profile image" },
//                     { status: 500 }
//                 );
//             }
//         }

//         const hashedPassword = await bcrypt.hash(Password, 10);

//         await connectMongoDB();

//         // Check if the user already exists
//         const existingUser = await User.findOne({ Email });
//         if (existingUser) {
//             return NextResponse.json(
//                 { message: "User with this email already exists" },
//                 { status: 409 }
//             );
//         }

//         await User.create({
//             FirstName,
//             LastName,
//             Email,
//             Phone,
//             Password: hashedPassword,
//             ProfileImage: imageUrl
//         });

//         return NextResponse.json(
//             { message: "User signed up successfully" },
//             { status: 201 }
//         );
//     } catch (error) {
//         console.error("Error in signup process:", error);
//         return NextResponse.json(
//             { message: "Internal Server Error" },
//             { status: 500 }
//         );
//     }
// }



///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//  NEW

import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { BlobServiceClient } from '@azure/storage-blob';
import crypto from 'crypto';

const accountName = process.env.ACCOUNT_NAME;
const containerName = process.env.CONTAINER_NAME;
const sasToken = process.env.SAS_TOKEN;

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const FirstName = formData.get('FirstName');
        const LastName = formData.get('LastName');
        const Email = formData.get('Email');
        const Phone = formData.get('Phone');
        const Password = formData.get('Password');
        const ConfirmPassword = formData.get('ConfirmPassword');
        const profileImage = formData.get('ProfileImage');

        if (!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        let imageUrl = null;
        if (profileImage && profileImage.size > 0) {
            const arrayBuffer = await profileImage.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const blobName = crypto.randomBytes(16).toString("hex") + '-' + profileImage.name;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            try {
                await blockBlobClient.uploadData(buffer, {
                    blobHTTPHeaders: { blobContentType: profileImage.type }
                });
                imageUrl = blockBlobClient.url;
            } catch (uploadError) {
                console.error("Error uploading image to Azure Blob Storage:", uploadError);
                return NextResponse.json(
                    { message: "Error uploading profile image" },
                    { status: 500 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        await connectMongoDB();

        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        await User.create({
            FirstName,
            LastName,
            Email,
            Phone,
            Password: hashedPassword,
            ProfileImage: imageUrl
        });

        return NextResponse.json(
            { message: "User signed up successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in signup process:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
