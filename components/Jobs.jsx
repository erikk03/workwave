"use client";

import { useState, useEffect } from "react";
import { Button, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { Trash2, Eye } from "lucide-react";

export default function Jobs() {
    const { data: session, status } = useSession();
    const [ads, setAds] = useState([]);
    const [applications, setApplications] = useState([]);
    const [viewingApplications, setViewingApplications] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [appliedListings, setAppliedListings] = useState({});
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [newAd, setNewAd] = useState({
        title: "",
        description: "",
        skillsRequired: "",
        location: "",
        employmentType: "Full-time",
        salary: "",
        company: ""
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch('/api/listings');
                const data = await response.json();
                setAds(data);
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        const fetchUserApplications = async () => {
            if (status === "loading" || !session?.user?.userId) return;
            try {
                const response = await fetch(`/api/application?applicant_id=${session.user.userId}`);
                const data = await response.json();
                const appliedListingIds = data.reduce((acc, app) => {
                    acc[app.listingId] = true;
                    return acc;
                }, {});
                setAppliedListings(appliedListingIds);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        fetchAds();
        fetchUserApplications();
    }, [status, session?.user?.userId]);

    const applyToAd = async (adId) => {
        if (status === "loading") return;
        if (!session?.user?.userId) {
            alert("User ID is missing");
            return;
        }

        if (appliedListings[adId]) {
            alert("You have already applied to this listing.");
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
                    resume: null,
                }),
            });
            if (!response.ok) throw new Error("Failed to apply");

            // After applying, send a notification to the owner of the listing
            // const listing = ads.find(ad => ad._id === adId);
            // await fetch('/api/notifications/job_app', {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //         type: "application",
            //         userId: listing.postedById, // Recipient of the notification
            //         userFirstName: session.user.firstName,
            //         userLastName: session.user.lastName,
            //         postId: "",
            //         comment: `Someone applied to your listing with title: ${listing.title}`
            //     }),
            // });

            alert("Application submitted!");
            setAppliedListings(prev => ({ ...prev, [adId]: true }));
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
    
            // If status is Denied, remove the application from the applications state
            if (status === "Denied") {
                const updatedApplications = applications.filter(app => app._id !== appId);
                setApplications(updatedApplications);
    
                // If no applications are left after denial, close the applications view
                if (updatedApplications.length === 0) {
                    setViewingApplications(false);
                    alert("No applications for this listing.");
                }
            } else if (status === "Accepted") {
                // You can add specific logic here if needed when an application is accepted
                const updatedApplications = applications.filter(app => app._id !== appId);
                setApplications(updatedApplications);
            }
    
            // Optional: You can handle further actions based on status if needed
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };
    
    
    const closeApplicationsView = () => {
        setViewingApplications(false);
        setApplications([]);
    };

    return (
        <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
            <div className="mt-5 bg-white rounded-xl p-3">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-semibold mb-2">Job Advertisements</h1>
                </div>
                <div className="flex items-center justify-center">
                    <Button color="primary" size="sm" variant="ghost" onPress={onOpen}>
                        Create New
                    </Button>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" placement="center">
                <ModalContent>
                    <ModalHeader>Create Job Advertisement</ModalHeader>
                    <ModalBody>
                        <input name="title" placeholder="Title" onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} value={newAd.title} />
                        <input name="description" placeholder="Description" onChange={(e) => setNewAd({ ...newAd, description: e.target.value })} value={newAd.description} fullWidth />
                        <input name="skillsRequired" placeholder="Skills Required" onChange={(e) => setNewAd({ ...newAd, skillsRequired: e.target.value })} value={newAd.skillsRequired} fullWidth />
                        <input name="location" placeholder="Location" onChange={(e) => setNewAd({ ...newAd, location: e.target.value })} value={newAd.location} fullWidth />
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered" size="sm">
                                    {newAd.employmentType}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu onAction={(key) => setNewAd({ ...newAd, employmentType: key })}>
                                <DropdownItem key="Full-time">Full-time</DropdownItem>
                                <DropdownItem key="Part-time">Part-time</DropdownItem>
                                <DropdownItem key="Contract">Contract</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <input name="salary" placeholder="Salary" onChange={(e) => setNewAd({ ...newAd, salary: e.target.value })} value={newAd.salary} fullWidth />
                        <input name="company" placeholder="Company" onChange={(e) => setNewAd({ ...newAd, company: e.target.value })} value={newAd.company} fullWidth />
                    </ModalBody>
                    <ModalFooter>
                        <Button size="sm" color="success" onClick={createAd}>
                            Create
                        </Button>
                        <Button size="sm" color="danger" variant="light" onPress={onOpenChange}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {ads.map(ad => (
                <div key={ad._id} className={`mt-5 bg-white rounded-xl p-3 ${!ad.isActive ? 'opacity-50' : ''}`}>
                    <h2 className="flex justify-center font-bold">{ad.title}</h2>
                    <p className="flex justify-center">{ad.description}</p>
                    <hr className="mt-2 mb-2" />
                    <p><strong>Skills Required:</strong> {ad.skillsRequired}</p>
                    <p><strong>Location:</strong> {ad.location}</p>
                    <p><strong>Employment Type:</strong> {ad.employmentType}</p>
                    <p><strong>Salary:</strong> {ad.salary}</p>
                    <p><strong>Company:</strong> {ad.company}</p>
                    <hr className="mt-2 mb-2" />
                    {ad.acceptedUser?.includes(session?.user?.userId) && <p className="text-green-500 font-bold">Accepted</p>}
                    {session?.user?.userId === ad.postedById ? (
                        <div className="flex justify-between">
                            {ad.isActive &&(
                                <Button color="primary" size="sm" variant="ghost" onClick={() => viewApplications(ad._id)}>
                                    <Eye size={15} /> View Applications
                                </Button>
                            )}
                            <Button color="danger" size="sm" variant="ghost" onClick={() => deleteAd(ad._id)}>
                                <Trash2 size={15} /> Delete
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end">
                            <Button color={appliedListings[ad._id] || !ad.isActive ? "default" : "primary"} size="sm" variant={appliedListings[ad._id] || !ad.isActive ? "faded" : "ghost"} onClick={() => applyToAd(ad._id)} disabled={appliedListings[ad._id] || !ad.isActive}>
                                {ad.isAccepted ? 'Closed' : appliedListings[ad._id] ? 'Already Applied' : 'Apply'}
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            {viewingApplications && (
                <Modal isOpen={viewingApplications} onOpenChange={closeApplicationsView} backdrop="blur" placement="center">
                    <ModalContent>
                        <ModalHeader>Applications for Job Adv. with Id: {selectedListingId}</ModalHeader>
                        <ModalBody>
                            {applications.length === 0 ? (
                                <p>No applications for this job.</p>
                            ) : (
                                <ul>
                                    {applications.map(app => (
                                        <li key={app._id}>
                                            <p><strong>Applicant Name:</strong> {app.applicantId.firstName}</p>
                                            <p><strong>Applicant Last Name:</strong> {app.applicantId.lastName}</p>
                                            <p><strong>Cover Letter:</strong> {app.coverLetter}</p>
                                            <p><strong>Resume:</strong> {app.resume ? <a href={app.resume} target="_blank" rel="noopener noreferrer">View Resume</a> : 'No resume provided'}</p>
                                            <hr className="mt-2 mb-2"/>
                                            <div className="flex justify-between">
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => updateApplicationStatus(app._id, 'Accepted')}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => updateApplicationStatus(app._id, 'Denied')}
                                                >
                                                    Deny
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
}
