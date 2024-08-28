import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { BlobSASPermissions, generateBlobSASQueryParameters } from "@azure/storage-blob";
import Post from "@/models/post";
import User from "@/models/user"; // Import User model
import {Comment} from "@/models/comment";
import Message from "@/models/message";

const accountName = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;

if (!accountName || !accountKey) {
    throw new Error("Azure Storage account name and key must be provided in environment variables.");
}

const SharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    SharedKeyCredential
);

export function generateSasToken(containerName, blobName) {

    // Define SAS token options
    const permissions = new BlobSASPermissions();
    permissions.write = true;
    permissions.create = true;
    permissions.read = true;

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + (60 * 24)); // 24 hours from now

    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: containerName,
            permissions: permissions,
            expiresOn: expiryDate,
        },
        SharedKeyCredential        
        ).toString();

    return sasToken;
}

export async function updateMediaUrls() {

    try {

        const threshold = 5*60*1000;

        // Update post media
        const posts = await Post.find();
        for (const post of posts) {
            if(post.mediaUrl) {
                const expiryTime = parseSasTokenExpiry(post.mediaUrl);
                const timeRemaining = expiryTime - Date.now();
                
                if (timeRemaining <= threshold) {
                    const containerName = process.env.CONTAINER_NAME_2; // posts container name
                    const blobName = extractBlobName(post.mediaUrl);
                    
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blobClient = containerClient.getBlobClient(blobName);

                    const sasToken = generateSasToken(containerName, blobName);

                    const newUrl = `${blobClient.url}?${sasToken}`;

                    post.mediaUrl = newUrl;
                    await post.save();

                    console.log(">>> Post image URLs updated successfully!");
                }
            }
        }

        // Update profile images
        const users = await User.find(); // Fetch all users
        const comments = await Comment.find(); // Fetch all comments
        const messages = await Message.find(); // Fetch all messages
        for (const user of users) {
            //Update profile image and user image in posts and comments
            if (user.profileImage) {
                const expiryTime = parseSasTokenExpiry(user.profileImage);
                const timeRemaining = expiryTime - Date.now();

                if(timeRemaining <= threshold) {

                    const containerName = process.env.CONTAINER_NAME_1; // Profile images container name
                    const blobName = extractBlobName(user.profileImage);

                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blobClient = containerClient.getBlobClient(blobName);

                    const sasToken = generateSasToken(containerName, blobName);

                    const newUrl =  `${blobClient.url}?${sasToken}`;
                    
                    user.profileImage = newUrl;
                    await user.save();

                    for (const post of posts) {
                        if (post.user.userId === user._id.toString()) {
                            post.user.userImage = newUrl;
                            await post.save();
                        }
                    }

                    for (const comment of comments) {
                        if (comment.user.userId === user._id.toString()) {
                            comment.user.userImage = newUrl;
                            await comment.save();
                        }
                    }

                    for (const msg of messages){
                        if (msg.sender._id.toString() === user._id.toString()) {
                            msg.sender.userImage = newUrl;
                            await msg.save();
                        }else if (msg.recipient._id.toString() === user._id.toString()) {
                            msg.recipient.userImage = newUrl;
                            await msg.save();
                        }
                    }

                    console.log(">>> Profile image URLs updated successfully!");
                }
            }

            // Update cv media
            if(user.cv) {
                const expiryTime = parseSasTokenExpiry(user.cv);
                const timeRemaining = expiryTime - Date.now();
                
                if (timeRemaining <= threshold) {
                    const containerName = process.env.CONTAINER_NAME_3; // cv container name
                    const blobName = extractBlobName(user.cv);
                    
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blobClient = containerClient.getBlobClient(blobName);

                    const sasToken = generateSasToken(containerName, blobName);

                    const newUrl = `${blobClient.url}?${sasToken}`;

                    user.cv = newUrl;
                    await user.save();

                    console.log(">>> CV URLs updated successfully!");
                }
            }
        }

    } catch (error) {
        console.error("Error updating URLs:", error);
    }
}

function extractBlobName(url) {
    const parts = url.split("/");
    return parts[parts.length - 1].split("?")[0]; // Extract blob name from URL
}

function parseSasTokenExpiry(url) {
    const params = new URLSearchParams(url.split('?')[1]);
    const expiryParam = params.get('se');
    if (expiryParam) {
        return new Date(expiryParam).getTime(); // Convert expiry time to milliseconds since epoch
    }
    return 0; // Default to 0 if no expiry time is found
}