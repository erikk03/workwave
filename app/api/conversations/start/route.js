import { connectMongoDB } from '@/lib/mongodb';
import Conversation from '@/models/conversation';
import User from '@/models/user'; // Assuming User is the user model
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';


export async function POST(req) {
    try {
        await connectMongoDB();

        // Get session to identify the logged-in user
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'You must be logged in to start a conversation.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const loggedInUserId = session.user.userId;
        const { userId } = await req.json();

        if (!userId || loggedInUserId === userId) {
            return new Response(JSON.stringify({ error: 'Invalid user ID.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if the user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return new Response(JSON.stringify({ error: 'User does not exist.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if a conversation between the users already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [loggedInUserId, userId] }
        });

        if (!conversation) {
            // Create a new conversation
            conversation = new Conversation({
                participants: [loggedInUserId, userId],
            });
            await conversation.save();
        }

        // Populate participants for the client side
        await conversation.populate('participants', 'firstName lastName');

        return new Response(JSON.stringify(conversation), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in POST /api/conversations/start:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while starting the conversation.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
