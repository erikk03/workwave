import { Application } from "@/models/application";
import { Listing } from "@/models/listing";
import  Interaction  from "@/models/interaction";
import { getServerSession } from "next-auth"
import User from "@/models/user";
import { NextResponse } from 'next/server';
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    try {

        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { listingId, applicantId } = await req.json();

        const user = await User.findById(applicantId);
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Validate the presence of required fields
        if (!listingId || !applicantId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Ensure the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        // Check if the user has already applied to this listing
        const existingApplication = await Application.findOne({ listingId, applicantId });
        if (existingApplication) {
            return new NextResponse("You have already applied to this listing", { status: 409 });
        }

        // Create a new application
        const application = new Application({
            listingId,
            applicantId,
            resume: user.cv || null, // Use null if resume is not provided
        });
        await application.save();

        // Add the application to the listing's applicants
        listing.applicants.push(applicantId);
        await listing.save();

        
        // Create or update the interaction record
        await Interaction.findOneAndUpdate(
            { userId: session?.user?.userId, listingId: application.listingId },
            { interaction: 1 }, // or another interaction score if needed
            { upsert: true }
        );

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error("Error applying to listing:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const listingId = url.searchParams.get('listing_id');
        const applicantId = url.searchParams.get('applicant_id');
        
        if (applicantId) {
            const applications = await Application.find({ applicantId }).lean();
            return NextResponse.json(applications);
        }

        if (!listingId) {
            return new NextResponse("Listing ID is required", { status: 400 });
        }

        const applications = await Application.find({ listingId }).populate('applicantId').lean();

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
