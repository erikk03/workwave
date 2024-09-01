import { connectMongoDB } from "@/lib/mongodb";
import { Listing } from "@/models/listing";
import { MatrixFactorization } from "@/lib/matrixFactorization";
import Interaction from '@/models/interaction';
import { Application } from "@/models/application";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from 'next/server';
import User from "@/models/user"; 

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
// export async function GET(request) {
//     try {
//         // Get the user session
//         const session = await getServerSession(authOptions);
//         if (!session || !session.user?.userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         // Connect to the MongoDB database
//         await connectMongoDB();

//         // Find the user to get their skills
//         const user = await User.findById(session.user.userId).lean();
//         let userSkillsArray = [];
//         let matchingListings = [];
//         let otherListings = [];

//         if (user && user.skills) {
//             userSkillsArray = user.skills.split(',').map(skill => skill.trim()); // Assuming skills are comma-separated

//             // Query for listings that match user skills
//             matchingListings = await Listing.find({
//                 skillsRequired: { $in: userSkillsArray }
//             })
//             .populate({
//                 path: 'applicants',
//                 select: 'applicantId', // Adjust the fields based on your model
//             })
//             .sort({ createdAt: -1 })
//             .lean();

//             // Query for all other listings not matching user skills
//             otherListings = await Listing.find({
//                 skillsRequired: { $nin: userSkillsArray }
//             })
//             .populate({
//                 path: 'applicants',
//                 select: 'applicantId', // Adjust the fields based on your model
//             })
//             .sort({ createdAt: -1 })
//             .lean();
//         } else {
//             // If no user skills are found, treat all listings as "other listings"
//             otherListings = await Listing.find().sort({ createdAt: -1 }).lean();
//         }

//         // Combine the listings: matching ones first, then other listings
//         const listings = [...matchingListings, ...otherListings];

//         return NextResponse.json(listings);
//     } catch (error) {
//         console.error("Error fetching listings:", error);
//         return new NextResponse("Internal server error", { status: 500 });
//     }
// }




// A utility function to fetch all users and listings
async function fetchAllUsersAndListings() {
    const users = await User.find({}, '_id').lean();
    const listings = await Listing.find({}, '_id skillsRequired location employmentType').lean(); // Fetch listings with required fields

    const userIds = users.map(user => user._id.toString());
    const listingIds = listings.map(listing => listing._id.toString());

    return { userIds, listingIds, listings };
}

// A utility function to create mappings from user/listing IDs to indices
function createMappings(userIds, listingIds) {
    const userIdToIndex = {};
    const listingIdToIndex = {};

    userIds.forEach((userId, index) => {
        userIdToIndex[userId] = index;
    });

    listingIds.forEach((listingId, index) => {
        listingIdToIndex[listingId] = index;
    });

    return { userIdToIndex, listingIdToIndex };
}

// A utility function to calculate matrix factorization recommendations for a specific user
async function calculateRecommendationsForUser(userId, numFactors = 2) {
    // Fetch all users, listings, and their corresponding IDs
    const { userIds, listingIds, listings } = await fetchAllUsersAndListings();

    // Create mappings from IDs to indices for users and listings
    const { userIdToIndex, listingIdToIndex } = createMappings(userIds, listingIds);

    // Fetch all interactions
    const interactions = await Interaction.find().lean();

    const numUsers = userIds.length;
    const numListings = listingIds.length;

    // Initialize the matrix factorization model
    const mf = new MatrixFactorization(numUsers, numListings, numFactors);
    
    // Initialize interaction-based ratings
    mf.initializeRatings(interactions, userIdToIndex, listingIdToIndex);
        
    // Train the model
    mf.train();

    // Get recommendations for the current user
    const currentUserIndex = userIdToIndex[userId.toString()];
    const userRecommendations = Array(numListings).fill().map((_, listingIndex) => ({
        listingId: listingIds[listingIndex],
        score: mf.predict(currentUserIndex, listingIndex)
    }));

    // Sort recommendations by score in descending order
    userRecommendations.sort((a, b) => b.score - a.score);

    console.log("User Recommendations:", userRecommendations);

    return userRecommendations;
}


// export async function GET(request) {
//     try {
//         // Get the user session
//         const session = await getServerSession(authOptions);
//         if (!session || !session.user?.userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         // Connect to the MongoDB database
//         await connectMongoDB();

//         // Find the user to get their skills
//         const user = await User.findById(session.user.userId).lean();
//         let userSkillsArray = [];
//         let matchingListings = [];
//         let otherListings = [];

//         if (user && user.skills) {
//             userSkillsArray = user.skills.split(',').map(skill => skill.trim()); // Assuming skills are comma-separated

//             // Query for listings that match user skills
//             matchingListings = await Listing.find({
//                 skillsRequired: { $in: userSkillsArray }
//             })
//             .populate({
//                 path: 'applicants',
//                 select: 'applicantId',
//             })
//             .sort({ createdAt: -1 })
//             .lean();

//             // Query for all other listings not matching user skills
//             otherListings = await Listing.find({
//                 skillsRequired: { $nin: userSkillsArray }
//             })
//             .populate({
//                 path: 'applicants',
//                 select: 'applicantId',
//             })
//             .sort({ createdAt: -1 })
//             .lean();
//         } else {
//             // If no user skills are found, treat all listings as "other listings"
//             otherListings = await Listing.find().sort({ createdAt: -1 }).lean();
//         }

//         // Calculate recommendations using Matrix Factorization for the current user
//         const recommendations = await calculateRecommendationsForUser(session.user.userId);

//         // Filter out listings from `otherListings` that are already included in `matchingListings`
//         const filteredOtherListings = otherListings.filter(listing => 
//             !matchingListings.some(match => match._id.toString() === listing._id.toString())
//         );

//         // // Merge matrix factorization results with the other listings
//         const recommendedListingsByScore = recommendations.map(rec => 
//             filteredOtherListings.find(listing => listing._id.toString() === rec.listingId.toString())
//         ).filter(Boolean);

//         // Combine the listings: skill-matching, matrix factorization, then other by recency
//         const finalListings = [
//             ...matchingListings,
//             ...recommendedListingsByScore,
//             // ...filteredOtherListings
//         ];

//         return NextResponse.json(finalListings);
//     } catch (error) {
//         console.error("Error fetching listings:", error);
//         return new NextResponse("Internal server error", { status: 500 });
//     }
// }


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
        let userOwnListings = [];
        let inactiveListings = [];

        // Query for listings made by the user
        userOwnListings = await Listing.find({
            postedById: session.user.userId,
            // isActive: true // Only active listings
        })
        .populate({
            path: 'applicants',
            select: 'applicantId',
        })
        .sort({ createdAt: -1 })
        .lean();

        if (user && user.skills) {
            userSkillsArray = user.skills.split(',').map(skill => skill.trim()); // Assuming skills are comma-separated

            // Query for listings that match user skills
            matchingListings = await Listing.find({
                skillsRequired: { $in: userSkillsArray },
                postedById: { $ne: session.user.userId }, // Exclude listings made by the user
                isActive: true // Only active listings
            })
            .populate({
                path: 'applicants',
                select: 'applicantId',
            })
            .sort({ createdAt: -1 })
            .lean();

            // Query for all other listings not matching user skills
            otherListings = await Listing.find({
                skillsRequired: { $nin: userSkillsArray },
                postedById: { $ne: session.user.userId }, // Exclude listings made by the user
                isActive: true // Only active listings
            })
            .populate({
                path: 'applicants',
                select: 'applicantId',
            })
            .sort({ createdAt: -1 })
            .lean();
        } else {
            // If no user skills are found, treat all listings as "other listings"
            otherListings = await Listing.find({
                postedById: { $ne: session.user.userId }, // Exclude listings made by the user
                isActive: true // Only active listings
            }).sort({ createdAt: -1 }).lean();
        }

        // Query for inactive listings 
            inactiveListings = await Listing.find({
            postedById: { $ne: session.user.userId }, // Exclude listings made by the session user
            isActive: false // Only inactive listings
        })
        .populate({
            path: 'applicants',
            select: 'applicantId',
        })
        .sort({ createdAt: -1 })
        .lean();

        // Calculate recommendations using Matrix Factorization for the current user
        const recommendations = await calculateRecommendationsForUser(session.user.userId);

        // Filter out listings from `otherListings` that are already included in `matchingListings`
        const filteredOtherListings = otherListings.filter(listing => 
            !matchingListings.some(match => match._id.toString() === listing._id.toString())
        );

        // Merge matrix factorization results with the other listings
        const recommendedListingsByScore = recommendations.map(rec => 
            filteredOtherListings.find(listing => listing._id.toString() === rec.listingId.toString())
        ).filter(Boolean);

        // Combine the listings: user's own listings first, skill-matching, matrix factorization, then other by recency
        const finalListings = [
            ...userOwnListings,
            ...matchingListings,
            ...recommendedListingsByScore,
            ...inactiveListings,
        ];

        return NextResponse.json(finalListings);
    } catch (error) {
        console.error("Error fetching listings:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
