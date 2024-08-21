// import { connectMongoDB } from '@/lib/mongodb';
// import User from '@/models/user';

// export async function PUT(request, { params }) {
//     try {
//         const { firstName, lastName, email, phone, position, industry, experience, education, skills} = await request.json();
//         await connectMongoDB();

//         // Find the user by ID
//         const user = await User.findById(params.userId);

//         if (!user) {
//             return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
//         }

//         // Update or create fields
//         user.firstName = firstName;
//         user.lastName = lastName;
//         user.email = email;
//         user.phone = phone;
//         user.position = position;
//         user.industry = industry;
//         user.experience = experience;
//         user.education = education;
//         user.skills = skills;

//         // Save the updated document
//         await user.save();
//         console.log('User updated:', user);
//         return new Response(JSON.stringify(user), { status: 200 });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         return new Response(JSON.stringify({ message: 'Error updating user' }), { status: 500 });
//     }
// }

import { BlobServiceClient } from '@azure/storage-blob';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';

export async function PUT(request, { params }) {
  try {
    const { firstName, lastName, email, phone, position, industry, experience, education, skills, cv } = await request.json();
    console.log("cv:", cv);
    await connectMongoDB();
    
    // Find the user by ID
    const user = await User.findById(params.userId);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    // Update or create fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.position = position;
    user.industry = industry;
    user.experience = experience;
    user.education = education;
    user.skills = skills;

    // Handle CV file upload to Azure Blob Storage
    if (cv) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerName = process.env.CONTAINER_NAME_3;

      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(`${user._id}.pdf`);
      await blockBlobClient.upload(cv, cv.length);
      user.cv = blockBlobClient.url;
    }

    // Save the updated document
    await user.save();
    console.log('User updated:', user);
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ message: 'Error updating user' }), { status: 500 });
  }
}