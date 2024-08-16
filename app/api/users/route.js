import { connectMongoDB } from '../../../lib/mongodb'; // Adjust path if necessary
import User from '../../../models/user'; // Adjust path if necessary

export async function GET() {
    try {
        await connectMongoDB();
        const users = await User.find({}).lean(); // Fetch all users from the database
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(JSON.stringify({ message: 'Error fetching users' }), { status: 500 });
    }
}
