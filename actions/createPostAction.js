'use server';

import Post from "@/models/post";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { generateSasToken } from "@/lib/azureblob";

export default async function createPostAction(formData, session) {
    console.log("postdata_post:", formData);
    
    const user = session?.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const postInput = formData.get("postInput")?.toString();
    const media = formData.get("media");    // can be image, video or audio

    let media_url = undefined;

    if (!postInput) {
        throw new Error("Post input is required");
    }

    const userDB = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userImage: user.profileImage || "",
    };

    try {
        if (media && media.size > 0) {
            
            // Get the Azure Storage account name, SAS token, and container name from environment variables
            const accountName = process.env.ACCOUNT_NAME;
            const containerName = process.env.CONTAINER_NAME_2;

            // Generate a unique file name for the media file using a random UUID and timestamp
            const timestamp = new Date().getTime();
            const fileExtension = media.type.split('/')[1]; // Extract the file extension
            
            const file_name = `${randomUUID()}_${timestamp}.${fileExtension}`;

            const sasToken = generateSasToken(containerName, file_name);

            // Create a BlobServiceClient using the account name and SAS token
            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net/?${sasToken}`
            );

            // Get the container client for the specified container name
            const containerClient = blobServiceClient.getContainerClient(containerName);

            // Get the block blob client for the file name
            const blockBlobClient = containerClient.getBlockBlobClient(file_name);
            
            // Convert the image file to an ArrayBuffer
            const mediaBuffer = await media.arrayBuffer();

            // Upload the image data to the block blob
            await blockBlobClient.uploadData(mediaBuffer);

            // Get the URL of the uploaded image
            media_url = blockBlobClient.url;
            
            // Create a new post with the user information, post input, and image URL
            const body = {
                user: userDB,
                text: postInput,
                mediaUrl: media_url,
                mediaType: media.type,
            };
            
            await Post.create(body);
        } else {

            // Create a new post with the user information and post input (no image)
            const body = {
                user: userDB,
                text: postInput,
            };

            await Post.create(body);
        }

        console.log(">>> Post created successfully!");
    
    } catch (error) {
        throw new Error(`Error creating post: ${error.message}`);
    }

    // Revalidate the cache for the home page
    revalidatePath("/");
}
