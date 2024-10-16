'use server';

import Post from "@/models/post";
import { Comment } from "@/models/comment"
import { revalidatePath } from "next/cache";
import { BlobServiceClient } from "@azure/storage-blob";

export default async function deletePostAction(postId, session) {
    const user = session?.user;

    if (!user?.userId) {
        throw new Error("User not authenticated");
    }

    // Find the post
    const post = await Post.findById(postId);

    if (!post) {
        throw new Error("Post not found");
    }

    // Check if the user is authorized to delete the post
    if (post.user.userId !== user.userId) {
        throw new Error("User not authorized to delete this post");
    }

    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

    // Handle media URL deletion
    const mediaUrl = post.mediaUrl || "";

    if (mediaUrl) {
        try {
            const { containerName, blobName } = extractContainerAndBlobFromUrl(mediaUrl);

            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.deleteIfExists();
            console.log(`>>> Media file ${blobName} removed successfully from container ${containerName}`);
        } catch (error) {
            console.error(">>> Error when removing media file from Azure Blob Storage", error);
            throw new Error("Failed to delete media file");
        }
    } else {
        console.log("No media URL found for the post. Skipping media deletion.");
    }

    // Find and delete all comments associated with the post
    try {
        const allComments = await Comment.find(); // Retrieve all comments

        for (const comment of allComments) {
            // Assuming comments have some way to be associated with the post, like being mentioned in the text
            if (post.comments.includes(comment._id)) {
                await Comment.deleteOne({ _id: comment._id });
                console.log(`>>> Comment with ID ${comment._id} removed successfully`);
            }
        }
    } catch (error) {
        console.error(">>> Error when removing comments", error);
        throw new Error("Failed to delete comments associated with the post");
    }

    // Remove the post from the database
    try {
        await post.removePost();
        console.log(">>> Post removed successfully from database!");

        // Revalidate the home page
        revalidatePath("/");
    } catch (error) {
        console.error(">>> Error when removing post", error);
        throw new Error("Failed to delete post");
    }
}

// Helper function to extract Container and Blob name from Azure Blob URL
function extractContainerAndBlobFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(part => part); // Remove empty parts

        if (parts.length < 2) {
            throw new Error("URL does not have enough parts to extract container and blob names.");
        }

        const containerName = parts[0]; // First part after the slash is the container name
        const blobName = parts.slice(1).join('/'); // The rest is the blob name

        return { containerName, blobName };
    } catch (error) {
        console.error(">>> Error extracting container and blob from URL:", error);
        throw new Error("Invalid URL provided for Azure Blob Storage.");
    }
}
