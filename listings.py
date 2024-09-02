import csv
import json
import random
from bson import ObjectId

# Function to generate a random ObjectId (simulating MongoDB ObjectId)
def generate_object_id():
    return str(ObjectId())

# Load users from CSV file
users = []
with open('/Users/vaggelis_kalabokis/Desktop/test_data/authapp.users.csv', mode='r') as file:
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        users.append({
            "_id": row["_id"],
            "firstName": row["firstName"],
            "lastName": row["lastName"]
        })

# Define parameters
num_listings = 400
max_listings_per_user = 5
max_applicants_per_listing = 5
max_interactions_per_listing = 5

# Generate random listings
listings = []
for user in users:
    num_listings_for_user = random.randint(0, max_listings_per_user)
    for _ in range(num_listings_for_user):
        listing_id = generate_object_id()
        listing = {
            "_id": {"$oid": listing_id},
            "title": f"{user['firstName']}'s Job",
            "description": f"Description of {user['firstName']}'s job",
            "skillsRequired": ["Skill1", "Skill2"],  # Example skills, could be randomized
            "location": "Remote",
            "employmentType": random.choice(["Full-Time", "Part-Time", "Contract"]),
            "salary": f"${random.randint(50000, 150000)}",
            "company": f"{user['firstName']} Corp",
            "postedById": {"$oid": user["_id"]},
            "applicants": []
        }
        
        # Randomly generate applicants for this listing
        num_applicants = random.randint(0, max_applicants_per_listing)
        applicants = random.sample(users, k=num_applicants)
        listing["applicants"] = [{"$oid": applicant["_id"]} for applicant in applicants]

        listings.append(listing)

# Generate interactions based on listings and applicants
interactions = []
for listing in listings:
    for applicant in listing["applicants"]:
        interaction = {
            "_id": {"$oid": generate_object_id()},
            "listingId": listing["_id"],
            "userId": applicant,
            "__v": 0
        }
        interactions.append(interaction)

# Save listings to a JSON file
with open('listings.json', 'w') as listings_file:
    json.dump(listings, listings_file, indent=4)

# Save interactions to a JSON file
with open('interactions.json', 'w') as interactions_file:
    json.dump(interactions, interactions_file, indent=4)

print(f"Generated {len(listings)} listings and {len(interactions)} interactions.")
