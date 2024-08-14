import mongoose from 'mongoose';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // Connect to MongoDB without deprecated options
        await mongoose.connect(process.env.MONGODB_URI);

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminUser = new User({
                firstName: "Admin",   // Provide all required fields
                lastName: "User",
                email: adminEmail,
                phone: "0000000000",  // Provide a placeholder phone number
                password: hashedPassword,
                isAdmin: true
            });

            await adminUser.save();
            return new Response(JSON.stringify({ message: 'Admin user created successfully' }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'Admin user already exists' }), { status: 400 });
        }
    } catch (error) {
        console.error("Error details:", error.message); // Log error message
        console.error("Stack trace:", error.stack); // Log stack trace
        return new Response(JSON.stringify({ message: 'Error setting up admin user', error: error.message }), { status: 500 });
    } finally {
        await mongoose.disconnect();
    }
}
