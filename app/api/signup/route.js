import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const {FirstName, LastName, Email, Phone, Password, ConfirmPassword} = await req.json();
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        await connectMongoDB();
        await User.create({
            FirstName,
            LastName,
            Email,
            Phone,
            Password: hashedPassword
        })

        return NextResponse.json(
            {message: "User Signed up successfully"},
            {status: 201}
        );
    } catch (error) {
        return NextResponse.json(
            {message: "Error while signing up"},
            {status: 500}
        );
    }
}