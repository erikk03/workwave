import { connectMongoDB } from '../../../../lib/mongodb'; // Adjust path if necessary
import User from '../../../../models/user'; // Adjust path if necessary

export async function POST(request) {
    try {
        const { userIds } = await request.json();
        await connectMongoDB();
        const users = await User.find({ _id: { $in: userIds } }).lean(); // Fetch selected users from the database
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        console.error('Error fetching selected users:', error);
        return new Response(JSON.stringify({ message: 'Error fetching selected users' }), { status: 500 });
    }
}
