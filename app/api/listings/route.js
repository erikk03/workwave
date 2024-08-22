import { connectMongoDB } from "@/lib/mongodb";
import { Listing } from "@/models/listing";
import { Application } from "@/models/application";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

// Fetch all listings
export async function GET(request) {
    try {
        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Connect to the MongoDB database
        await connectMongoDB();
        
        // Find all listings and populate related fields
        const listings = await Listing.find()
            .populate({
                path: 'applicants',
                select: 'applicantId', // Adjust the fields based on your model
            })
            .lean();

        return NextResponse.json(listings);
    } catch (error) {
        console.error("Error fetching listings:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

// Create a new listing
export async function POST(req) {
    try {
        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Connect to the MongoDB database
        await connectMongoDB();

        // Parse the request body
        const newListing = await req.json();
        console.log("New Listing Data:", newListing);

        // Check if postedById is present, if not, use the userId from the session
        if (!newListing.postedById) {
            newListing.postedById = session.user.userId;
        }

        // Create the listing
        const listing = await Listing.create(newListing);
        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        console.error("Error creating listing:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
