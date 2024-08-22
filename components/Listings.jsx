"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function Listings() {
  const { data: session, status } = useSession();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    location: "",
    employmentType: "Full-time",
    salary: "",
    company: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [viewingApplications, setViewingApplications] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/listings');
        if (!response.ok) throw new Error("Failed to fetch ads");
        const data = await response.json();
        setAds(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAd(prevState => ({ ...prevState, [name]: value }));
  };

  const createAd = async () => {
    if (status === "loading") return;
    if (!session?.user?.userId) {
      alert("User not authenticated");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/listings', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newAd, postedById: session.user.userId }),
      });
      if (!response.ok) throw new Error("Failed to create ad");
      const data = await response.json();
      setAds([...ads, data]);
      setNewAd({
        title: "",
        description: "",
        skillsRequired: "",
        location: "",
        employmentType: "Full-time",
        salary: "",
        company: ""
      });
      setShowForm(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const deleteAd = async (adId) => {
    try {
      const response = await fetch(`/api/listings/${adId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ad");
      setAds(ads.filter(ad => ad._id !== adId));
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const applyToAd = async (adId) => {
    if (status === "loading") return;
    if (!session?.user?.userId) {
      alert("User ID is missing");
      return;
    }

    try {
      const response = await fetch('/api/application', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: adId,
          applicantId: session.user.userId,
          coverLetter: "Your cover letter here",
          resume: "Link to your resume or file path"
        }),
      });

      if (!response.ok) throw new Error("Failed to apply");
      alert("Application submitted!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const viewApplications = async (adId) => {
    try {
      const response = await fetch(`/api/application?listing_id=${adId}`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data);
      setSelectedListingId(adId);
      setViewingApplications(true);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      const response = await fetch(`/api/application/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update application status");
      await response.json();
      
      // Remove applicant from the listing's applicants array
      const ad = ads.find(ad => ad._id === selectedListingId);
      const updatedApplicants = ad.applicants.filter(applicant => applicant.toString() !== applications.find(app => app._id === appId).applicantId.toString());
      
      setAds(ads.map(ad => ad._id === selectedListingId ? { ...ad, applicants: updatedApplicants } : ad));

      // Remove the application from the list
      setApplications(applications.filter(app => app._id !== appId));

      // If no applications are left, update the view
      if (applications.length === 1) { // Because the application was just removed
        setViewingApplications(false);
        alert("No applications for this listing.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const closeApplicationsView = () => {
    setViewingApplications(false);
    setApplications([]);
  };

  if (status === "loading") return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Listings</h1>
      <div style={{ marginBottom: '20px' }}>
        <Button
          onClick={() => setShowForm(!showForm)}
          css={{ marginBottom: '10px' }}
        >
          {showForm ? 'Hide Form' : 'Create New Listing'}
        </Button>
        {showForm && (
          <div>
            <label>
              Title:
              <input
                name="title"
                placeholder="Title"
                onChange={handleInputChange}
                value={newAd.title}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                placeholder="Description"
                onChange={handleInputChange}
                value={newAd.description}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <label>
              Skills Required:
              <input
                name="skillsRequired"
                placeholder="Skills Required"
                onChange={handleInputChange}
                value={newAd.skillsRequired}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <label>
              Location:
              <input
                name="location"
                placeholder="Location"
                onChange={handleInputChange}
                value={newAd.location}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <label>
              Employment Type:
              <select
                name="employmentType"
                onChange={handleInputChange}
                value={newAd.employmentType}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </label>
            <label>
              Salary:
              <input
                name="salary"
                placeholder="Salary"
                onChange={handleInputChange}
                value={newAd.salary}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <label>
              Company:
              <input
                name="company"
                placeholder="Company"
                onChange={handleInputChange}
                value={newAd.company}
                style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              />
            </label>
            <Button
              onClick={createAd}
              disabled={creating}
              css={{ marginTop: '10px' }}
            >
              {creating ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        )}
      </div>
      <ul>
        {ads.map(ad => (
          <li key={ad._id} style={{ marginBottom: '20px' }}>
            <h2>{ad.title}</h2>
            <p>{ad.description}</p>
            <p><strong>Skills Required:</strong> {ad.skillsRequired}</p>
            <p><strong>Location:</strong> {ad.location}</p>
            <p><strong>Employment Type:</strong> {ad.employmentType}</p>
            <p><strong>Salary:</strong> {ad.salary}</p>
            <p><strong>Company:</strong> {ad.company}</p>
            {session?.user?.userId === ad.postedById ? (
              <>
                <Button
                  onClick={() => deleteAd(ad._id)}
                  css={{ marginTop: '10px', marginRight: '10px' }}
                >
                  Delete Listing
                </Button>
                <Button
                  onClick={() => viewApplications(ad._id)}
                  css={{ marginTop: '10px' }}
                >
                  View Applications
                </Button>
              </>
            ) : (
              <Button
                onClick={() => applyToAd(ad._id)}
                css={{ marginTop: '10px' }}
              >
                Apply
              </Button>
            )}
          </li>
        ))}
      </ul>
      {viewingApplications && (
        <div>
          <h2>Applications for Listing {selectedListingId}</h2>
          <Button onClick={closeApplicationsView}>Close</Button>
          {applications.length === 0 ? (
            <p>No applications for this listing.</p>
          ) : (
            <ul>
              {applications.map(app => (
                <li key={app._id} style={{ marginBottom: '20px' }}>
                  <p><strong>Applicant Name:</strong> {app.applicantId.firstName}</p>
                  <p><strong>Applicant Last Name:</strong> {app.applicantId.lastName}</p>
                  <p><strong>Cover Letter:</strong> {app.coverLetter}</p>
                  <p><strong>Resume:</strong> {app.resume ? <a href={app.resume} target="_blank" rel="noopener noreferrer">View Resume</a> : 'No resume provided'}</p>
                  <Button
                    onClick={() => updateApplicationStatus(app._id, 'Accepted')}
                    css={{ marginTop: '10px', marginRight: '10px' }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus(app._id, 'Denied')}
                    css={{ marginTop: '10px' }}
                  >
                    Deny
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
