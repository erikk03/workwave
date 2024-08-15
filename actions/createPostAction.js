'use server';

import Post from "@/models/post";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function createPostAction(formData, session) {
    const user = session?.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const postInput = formData.get("postInput")?.toString();
    const image = formData.get("image");

    let image_url = undefined;

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
        if (image && image.size > 0) {

            // Get the Azure Storage account name, SAS token, and container name from environment variables
            const accountName = process.env.ACCOUNT_NAME;
            const sasToken = process.env.SAS_TOKEN;
            const containerName = process.env.CONTAINER_NAME_2;

            // Create a BlobServiceClient using the account name and SAS token
            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net/?${sasToken}`
            );

            // Get the container client for the specified container name
            const containerClient = blobServiceClient.getContainerClient(containerName);

            // Generate a unique file name for the image using a random UUID and timestamp
            const timestamp = new Date().getTime();
            const file_name = `${randomUUID()}_${timestamp}.png`;

            // Get the block blob client for the file name
            const blockBlobClient = containerClient.getBlockBlobClient(file_name);
            
            // Convert the image file to an ArrayBuffer
            const imageBuffer = await image.arrayBuffer();

            // Upload the image data to the block blob
            await blockBlobClient.uploadData(imageBuffer);

            // Get the URL of the uploaded image
            image_url = blockBlobClient.url;
            
            // Create a new post with the user information, post input, and image URL
            const body = {
                user: userDB,
                text: postInput,
                imageUrl: image_url,
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

        console.log(">>> Post created succesfully!");
    
    } catch (error) {
        throw new Error(`Error creating post: ${error.message}`);
    }

    // Revalidate the cache for the home page
    revalidatePath("/");
}
