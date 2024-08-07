import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { Email } = await req.json();
        const user = await User.findOne({ Email }).select("_id");
        console.log("user:", user);
        return NextResponse.json({ user });
    } catch (error) {
        console.log("Error while checking user", error);
    }
}