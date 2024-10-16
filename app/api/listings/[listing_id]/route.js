import { Listing } from "@/models/listing";
import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
    try {
        const listing = await Listing.findById(params.listing_id)
            .populate('applicants')
            .lean();

        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error fetching listing:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listing = await Listing.findById(params.listing_id);
        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        if (listing.postedById.toString() !== session.user.userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const data = await req.json();
        const updatedListing = await Listing.findByIdAndUpdate(params.listing_id, data, { new: true });

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Error updating listing:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listing = await Listing.findById(params.listing_id);
        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        if (listing.postedById.toString() !== session.user.userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // await listing.remove();

        await Listing.deleteOne({ _id: params.listing_id });
        return new NextResponse("Listing deleted", { status: 200 });
    } catch (error) {
        console.error("Error deleting listing:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
