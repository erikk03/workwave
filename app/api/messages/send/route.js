import { connectMongoDB } from '@/lib/mongodb';
import Message from '@/models/message';
import Conversation from '@/models/conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
    try {
        await connectMongoDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'You must be logged in to send messages.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { conversationId, message, recipient } = await req.json();
        const senderId = session.user.id; // Make sure this matches how you store the user ID in the session

        if (!conversationId || !message || !recipient) {
            return new Response(JSON.stringify({ error: 'Conversation ID and message are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create a new message
        const newMessage = new Message({
            sender: senderId,
            recipient,
            conversationId,
            message,
            createdAt: new Date()
        });

        await newMessage.save();

        // Update the conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Populate the sender information
        await newMessage.populate('sender', 'firstName lastName');

        return new Response(JSON.stringify(newMessage), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/messages/send:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while sending the message.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}