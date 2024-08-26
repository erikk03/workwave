// import { connectMongoDB } from '@/lib/mongodb';
// import Message from '@/models/message';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export async function POST(req) {
//     try {
//         await connectMongoDB();

//         const session = await getServerSession(authOptions);

//         if (!session) {
//             return new Response(JSON.stringify({ error: 'You must be logged in to view messages.' }), {
//                 status: 401,
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }

//         const { conversationId } = await req.json();

//         if (!conversationId) {
//             return new Response(JSON.stringify({ error: 'Conversation ID is required.' }), {
//                 status: 400,
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }

//         const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

//         return new Response(JSON.stringify(messages), {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     } catch (error) {
//         console.error('Error in POST /api/messages:', error);
//         return new Response(JSON.stringify({ error: 'An error occurred while fetching messages.' }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }
// }

import { connectMongoDB } from '@/lib/mongodb';
import Message from '@/models/message';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
    try {
        await connectMongoDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'You must be logged in to view messages.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const url = new URL(req.url);
        const conversationId = url.pathname.split('/')[3]; // Adjust according to your routing logic
        // console.log("conv_id:", conversationId);

        if (!conversationId || conversationId === 'null') {
            return new Response(JSON.stringify({ error: 'Invalid conversation ID.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Fetch messages after the last message timestamp
        // const lastMessageTimestamp = new Date(); // You might need to handle this differently

        const newMessages = await Message.find({
            conversationId,
            // createdAt: { $gt: new Date(lastMessageTimestamp) }
        }).sort({ createdAt: 1 });

        return new Response(JSON.stringify(newMessages), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in GET /api/messages/[conversationId]:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while fetching messages.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req) {
    try {
        await connectMongoDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'You must be logged in to view messages.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { conversationId, lastMessageTimestamp } = await req.json();

        if (!conversationId) {
            return new Response(JSON.stringify({ error: 'Conversation ID is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Long polling implementation
        let newMessages = [];
        const pollInterval = 5000; // 5 seconds interval

        while (newMessages.length === 0) {
            // Fetch messages after the last message timestamp
            newMessages = await Message.find({
                conversationId,
                // createdAt: { $gt: new Date(lastMessageTimestamp) }
            }).sort({ createdAt: 1 });

            if (newMessages.length > 0) break;

            // Wait for a while before the next check
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        return new Response(JSON.stringify(newMessages), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/messages/[conversationId]:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while fetching messages.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
