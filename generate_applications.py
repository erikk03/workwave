from pymongo import MongoClient
from bson import ObjectId
import random

# MongoDB connection string
connection_string = "mongodb+srv://sdi2100045:y51hwuRlt5fQd9XF@cluster0.euvxu.mongodb.net/authapp"

# Connect to MongoDB
client = MongoClient(connection_string)
db = client.authapp

# Collections
listings_collection = db.listings
applications_collection = db.applications

def generate_application_id():
    """Generate a new MongoDB ObjectId"""
    return ObjectId()

def create_applications():
    # Fetch all listings
    listings = listings_collection.find({})

    for listing in listings:
        listing_id = listing["_id"]

        # Get the applicants for this listing
        applicants = listing.get("applicants", [])

        for applicant_id in applicants:
            # Create an application document
            application = {
                "_id": generate_application_id(),
                "listingId": listing_id,
                "applicantId": applicant_id,
                "resume": "",  # Assuming resume is null as per your requirement
                "status": "Pending"  # Default status
            }

            # Insert the application into the applications collection
            applications_collection.insert_one(application)

            print(f"Created application for listing {listing_id} and applicant {applicant_id}")

if __name__ == "__main__":
    create_applications()
    print("Applications have been generated and inserted into the 'applications' collection.")
