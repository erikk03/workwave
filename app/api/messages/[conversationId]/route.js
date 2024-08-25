import { connectMongoDB } from '@/lib/mongodb';
import Message from '@/models/message';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

        const { conversationId } = await req.json();

        if (!conversationId) {
            return new Response(JSON.stringify({ error: 'Conversation ID is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return new Response(JSON.stringify(messages), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/messages:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while fetching messages.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}