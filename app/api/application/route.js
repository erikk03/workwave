import { Application } from "@/models/application";
import { Listing } from "@/models/listing";
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { listingId, applicantId, coverLetter, resume } = await req.json();
        console.log("Received data:", { listingId, applicantId, coverLetter, resume });

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
            coverLetter: coverLetter || "", // Use an empty string if coverLetter is not provided
            resume: resume || null, // Use null if resume is not provided
        });
        await application.save();

        // Add the application to the listing's applicants
        listing.applicants.push(application._id);
        await listing.save();

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
