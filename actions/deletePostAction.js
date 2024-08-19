'use server';

import Post from "@/models/post"
import { revalidatePath } from "next/cache";
import { BlobServiceClient } from "@azure/storage-blob";

export default async function deletePostAction(postId, session) {
    const user = session?.user;

    if (!user?.userId) {
        throw new Error("User not authenticated");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new Error("Post not found");
    }

    if (post.user.userId !== user.userId) {
        throw new Error("User not authorized to delete this post");
    }

        // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

    // Assume post.mediaUrls is an array of Azure Blob URLs
    const mediaUrl = post.mediaUrl || "";
    try{
        // Delete media file from Azure Blob Storage
        const { containerName, blobName } = extractContainerAndBlobFromUrl(mediaUrl);

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.deleteIfExists();
        console.log(`>>> Media file ${blobName} removed successfully from container ${containerName}`);

        // Remove from database
        await post.removePost();
        console.log(">>> Post removed succesfully from database!");

        // Revalidate the home page
        revalidatePath("/");
    }catch(error){
        console.error(">>> Error when removing post", error);
        throw new Error("Failed to delete post");
    }
}

// Helper function to extract Container and Blob name from Azure Blob URL
function extractContainerAndBlobFromUrl(url) {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const containerName = parts[1]; // First part after the slash is the container name
    const blobName = parts.slice(2).join('/'); // The rest is the blob name
    return { containerName, blobName };
}