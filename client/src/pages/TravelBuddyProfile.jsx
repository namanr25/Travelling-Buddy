import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TravelBuddyProfile() {
    const { email } = useParams();
    const [buddyInfo, setBuddyInfo] = useState(null);

    useEffect(() => {
        axios.get(`/user-info/${email}`)
            .then(response => setBuddyInfo(response.data))
            .catch(error => console.error("Error fetching user info:", error));
    }, [email]);

    if (!buddyInfo) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 0115 0" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">{buddyInfo.name}</h1>
                    <p className="text-gray-500">{buddyInfo.profession}</p>
                    <p className="text-gray-700">Age: {buddyInfo.age} years</p>
                    <p className="text-gray-600">{buddyInfo.email}</p>
                    <p className="text-gray-700">{buddyInfo.addressLine1}, {buddyInfo.addressLine2}, {buddyInfo.addressLine3}</p>
                    {buddyInfo.socialMediaID && (
                        <p className="text-blue-500"><a href={buddyInfo.socialMediaID} target="_blank" rel="noopener noreferrer">Connect on Social Media</a></p>
                    )}
                    <p className="font-bold mt-2">Personality Category: <span className="text-blue-600">{buddyInfo.personalityCategory || "Not Assigned"}</span></p>
                </div>
            </div>
        </div>
    );
}