// File: app/api/application/[application_id]/route.js

import { NextResponse } from 'next/server';
import { Application } from "@/models/application";
import { Listing } from "@/models/listing";

export async function PATCH(req, { params }) {
  try {
    const { application_id } = params;
    const { status } = await req.json();

    // Find the application by ID
    const application = await Application.findById(application_id);
    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // Find the related listing
    const listing = await Listing.findById(application.listingId);
    if (listing) {
      // Remove applicant from the listing
      listing.applicants = listing.applicants.filter(
        applicant => applicant.toString() !== application.applicantId.toString()
      );
      await listing.save();
    }

    // Delete the application
    await Application.findByIdAndDelete(application_id);

    // Return a response confirming the deletion
    return NextResponse.json({ message: "Application status updated and application deleted" });
  } catch (error) {
    console.error("Error updating application status:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}


