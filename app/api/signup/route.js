import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { BlobServiceClient } from '@azure/storage-blob';
import crypto from 'crypto';
import { generateSasToken } from "@/lib/azureblob";

const accountName = process.env.ACCOUNT_NAME;
const containerName = process.env.CONTAINER_NAME_1;
const sasToken = generateSasToken(containerName, accountName);

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net/?${sasToken}`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const profileImage = formData.get('profileImage');

        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Passwords do not match" },
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

        const hashedPassword = await bcrypt.hash(password, 10);

        await connectMongoDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            profileImage: imageUrl,
            isAdmin: false
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
