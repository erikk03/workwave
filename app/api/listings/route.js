import { connectMongoDB } from "@/lib/mongodb";
import { Listing } from "@/models/listing";
import { Application } from "@/models/application";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from 'next/server';
import User from "@/models/user"; 

// Fetch all listings
// export async function GET(request) {
//     try {
//         // Get the user session
//         const session = await getServerSession(authOptions);
//         if (!session || !session.user?.userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         // Connect to the MongoDB database
//         await connectMongoDB();
        
//         // Find all listings and populate related fields
//         const listings = await Listing.find()
//             .populate({
//                 path: 'applicants',
//                 select: 'applicantId', // Adjust the fields based on your model
//             })
//             .lean();

//         return NextResponse.json(listings);
//     } catch (error) {
//         console.error("Error fetching listings:", error);
//         return new NextResponse("Internal server error", { status: 500 });
//     }
// }

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

        // Find the user to get their skills
        const user = await User.findById(session.user.userId).lean();
        let userSkillsArray = [];
        let matchingListings = [];
        let otherListings = [];

        if (user && user.skills) {
            userSkillsArray = user.skills.split(',').map(skill => skill.trim()); // Assuming skills are comma-separated

            // Query for listings that match user skills
            matchingListings = await Listing.find({
                skillsRequired: { $in: userSkillsArray }
            })
            .populate({
                path: 'applicants',
                select: 'applicantId', // Adjust the fields based on your model
            })
            .sort({ createdAt: -1 })
            .lean();

            // Query for all other listings not matching user skills
            otherListings = await Listing.find({
                skillsRequired: { $nin: userSkillsArray }
            })
            .populate({
                path: 'applicants',
                select: 'applicantId', // Adjust the fields based on your model
            })
            .sort({ createdAt: -1 })
            .lean();
        } else {
            // If no user skills are found, treat all listings as "other listings"
            otherListings = await Listing.find().sort({ createdAt: -1 }).lean();
        }

        // Combine the listings: matching ones first, then other listings
        const listings = [...matchingListings, ...otherListings];

        return NextResponse.json(listings);
    } catch (error) {
        console.error("Error fetching listings:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
