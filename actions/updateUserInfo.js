"use server";

import { randomUUID } from "crypto";
import { BlobServiceClient } from "@azure/storage-blob";
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { generateSasToken } from "@/lib/azureblob";
import { redirect } from "next/navigation";

export default async function updateUserInfo(formData, session) {
    await connectMongoDB();
    
    // Find the user
    const suser = session?.user;
    const user = await User.findById(suser.userId);

    if (!user) {
        return new Error("User not authenticated");
    }
    
    // Update user fields
    const fields = ['firstName', 'lastName', 'email', 'phone', 'position', 'industry', 'experience', 'education', 'skills'];
    fields.forEach(field => {
        const value = formData.get(field);
        if (value) user[field] = value.toString();
    });

    // Update visibility settings
    const visibilityFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'industry', 'experience', 'education', 'skills', 'cv'];
    visibilityFields.forEach(field => {
        const visibilityValue = formData.get(`visibilitySettings.${field}`);
        if (visibilityValue !== null) {
            user.visibilitySettings[field] = visibilityValue === 'true';
        }
    });

    const cv = formData.get("cv");


    if (cv && cv instanceof File) {
        try{

            const accountName = process.env.ACCOUNT_NAME;
            const containerName = process.env.CONTAINER_NAME_3;
            const file_name = `${randomUUID()}_${Date.now()}.pdf`;

            const sasToken = generateSasToken(containerName, file_name);

            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net/?${sasToken}`
            );

            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(file_name);

            const cvBuffer = await cv.arrayBuffer();
            await blockBlobClient.uploadData(cvBuffer);

            user.cv = blockBlobClient.url;            
        } catch(error){
            throw new Error("Error uploading CV: " + error.message);
        }
    }

    // Save the updated document
    await user.save();
    console.log('>>>User Information updated succesfully!');

    redirect(`/userinfo/${user._id.toString()}`);
}