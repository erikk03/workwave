"use client";

import { useState, useEffect } from "react";
import { Button, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger} from "@nextui-org/react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import {Trash2, Eye} from "lucide-react";

export default function jobs() {
	const {isOpen, onOpen, onOpenChange} = useDisclosure();
	const { data: session, status } = useSession();
	const [ads, setAds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState(null);
	const [newAd, setNewAd] = useState({
		title: "",
		description: "",
		skillsRequired: "",
		location: "",
		employmentType: "Full-time",
		salary: "",
		company: ""
	});
	const [applications, setApplications] = useState([]);
	const [viewingApplications, setViewingApplications] = useState(false);
	const [selectedListingId, setSelectedListingId] = useState(null);

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
    <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
      	<div className="mt-5 bg-white rounded-xl p-3">
	  		<div className="flex items-center justify-center">
				<h1 className="text-2xl font-semibold mb-2">Job Advertisments</h1>
			</div>
			<div className="flex items-center justify-center">
				<Button
					color="primary"
					size="sm"
					variant="ghost"
					onPress={onOpen}
				>
					Create New
				</Button>
			</div>
		</div>
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" placement="center">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							Create Job Advertisment
						</ModalHeader>
						<ModalBody>
							<input
								label="Title"
								name="title"
								placeholder="Title"
								onChange={handleInputChange}
								value={newAd.title}
							/>
							<input
								label="Description"
								name="description"
								placeholder="Description"
								onChange={handleInputChange}
								value={newAd.description}
								fullWidth
							/>
							<input
								label="Skills Required"
								name="skillsRequired"
								placeholder="Skills Required"
								onChange={handleInputChange}
								value={newAd.skillsRequired}
								fullWidth
							/>
							<input
								label="Location"
								name="location"
								placeholder="Location"
								onChange={handleInputChange}
								value={newAd.location}
								fullWidth
							/>
							<Dropdown>
								<DropdownTrigger>
									<Button 
										variant="bordered" 
										size="sm"
									>
										{newAd.employmentType}
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									aria-label="Employment Type"
									onAction={(key) => setNewAd({ ...newAd, employmentType: key })}
								>
									<DropdownItem key="Full-time">Full-time</DropdownItem>
									<DropdownItem key="Part-time">Part-time</DropdownItem>
									<DropdownItem key="Contract">Contract</DropdownItem>
								</DropdownMenu>
							</Dropdown>
							<input
								label="Salary"
								name="salary"
								placeholder="Salary"
								onChange={handleInputChange}
								value={newAd.salary}
								fullWidth
							/>
							<input
								label="Company"
								name="company"
								placeholder="Company"
								onChange={handleInputChange}
								value={newAd.company}
								fullWidth
							/>
						</ModalBody>
						<ModalFooter>
							<Button size="sm" color="success" onClick={createAd} onPress={onClose} >
								Create
							</Button>
							<Button size="sm" color="danger" variant="light" onPress={onClose}>
                  				Close
                			</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
			{ads.map(ad => (
				<div key={ad._id}>
					<div className="mt-5 bg-white rounded-xl p-3">
						<h2 className="flex justify-center font-bold">{ad.title}</h2>
						<p className="flex justify-center">{ad.description}</p>
						<hr className="mt-2 mb-2"/>
						<p><strong>Skills Required:</strong> {ad.skillsRequired}</p>
						<p><strong>Location:</strong> {ad.location}</p>
						<p><strong>Employment Type:</strong> {ad.employmentType}</p>
						<p><strong>Salary:</strong> {ad.salary}</p>
						<p><strong>Company:</strong> {ad.company}</p>
						<hr className="mt-2 mb-2"/>
						{session?.user?.userId === ad.postedById ? (
							<div className="flex justify-between">
								<Button
									color="primary"
									size="sm"
									variant="ghost"
									onClick={() => viewApplications(ad._id)}
								>
									<Eye size={15}/>View Applications
								</Button>
								<Button
									color="danger"
									size="sm"
									variant="ghost"
									onClick={() => deleteAd(ad._id)}
								>
									<Trash2 size={15}/>Delete
								</Button>
							</div>
						) : (
							<div className="flex justify-end">
								<Button
									color="primary"
									size="sm"
									variant="ghost"
									onClick={() => applyToAd(ad._id)}
								>
									Apply
								</Button>
							</div>
						)}
					</div>
				</div>
			))}
		{viewingApplications && (
			<Modal isOpen={viewingApplications} onOpenChange={closeApplicationsView} backdrop="blur" placement="center">
				<ModalContent>
					<ModalHeader>Applications for Listing with Id: {selectedListingId}</ModalHeader>
					<ModalBody>
						{applications.length === 0 ? (
							<p>No applications for this listing.</p>
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
												onClick={() => updateApplicationStatus(app._id, 'Denied')}										>
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
