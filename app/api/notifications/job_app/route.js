// // /api/notifications/createNotification.js

// import { connectMongoDB } from "@/lib/mongodb";
// import { Notification } from "@/models/notification";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";


// export async function POST(request) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session || !session.user?.userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const { type, userId, userFirstName, userLastName, postId, comment } = await request.json();
        
//         await connectMongoDB();
        
//         const newNotification = new Notification({
//             type,
//             userId,
//             userFirstName,
//             userLastName,
//             postId,
//             comment
//         });

//         await newNotification.save();

//         return NextResponse.json({ message: "Notification created successfully" });
//     } catch (error) {
//         console.error("Error creating notification:", error);
//         return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
//     }
// }