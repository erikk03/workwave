import { connectMongoDB } from '@/lib/mongodb';
import Conversation from '@/models/conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: 'You must be logged in to access this resource.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const loggedInUserId = session.user.userId;

    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [loggedInUserId, userId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [loggedInUserId, userId]
            });
            await conversation.save();
        }

        return new Response(JSON.stringify(conversation), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error fetching or creating conversation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: 'You must be logged in to access this resource.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await req.json();
    const { userId } = body;
    const loggedInUserId = session.user.userId;

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const conversation = new Conversation({
            participants: [loggedInUserId, userId]
        });
        await conversation.save();

        return new Response(JSON.stringify(conversation), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error creating conversation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}