'use server';

import { Post } from "@/models/post";
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
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userImage: user.profileImage || "",
    };

    try {
        if (image && image.size > 0) {
            console.log("Uploading image to blob storage", image);

            const accountName = process.env.ACCOUNT_NAME;
            const sasToken = process.env.SAS_TOKEN;
            const containerName = process.env.CONTAINER_NAME_2;

            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net/?${sasToken}`
            );

            const containerClient = blobServiceClient.getContainerClient(containerName);
            console.log("Container client created", containerClient);

            const timestamp = new Date().getTime();
            const file_name = `${randomUUID()}_${timestamp}.png`;

            const blockBlobClient = containerClient.getBlockBlobClient(file_name);
            console.log("Block blob client created", blockBlobClient);
            
            const imageBuffer = await image.arrayBuffer();
            console.log("Image buffer created", imageBuffer);

            await blockBlobClient.uploadData(imageBuffer);

            image_url = blockBlobClient.url;
            console.log("Image uploaded successfully", image_url);
        
            
            const body = {
                user: userDB,
                text: postInput,
                imageUrl: image_url,
            };
            
            await Post.create(body);
            console.log("Post created successfully");
        }else{

            const body = {
                user: userDB,
                text: postInput,
            };

            await Post.create(body);
        }

    } catch (error) {
        throw new Error(`Error creating post: ${error.message}`);
    }

    revalidatePath("/");
}
