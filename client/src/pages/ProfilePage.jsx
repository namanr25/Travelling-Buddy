import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "../AccountNav";

export default function ProfilePage() {
    const [redirect, setRedirect] = useState(null);
    const { ready, user, setUser } = useContext(UserContext);
    const [userInfo, setUserInfo] = useState(null);
    const [bookings, setBookings] = useState([]);
    let { subpage } = useParams();

    if (subpage === undefined) {
        subpage = "profile";
    }

    // Fetch user info
    useEffect(() => {
        if (user?.email) {
            axios.get(`/user-info/${user.email}`)
                .then(response => {
                    console.log("Fetched User Info: ", response.data);
                    setUserInfo(response.data)
                })
                .catch(error => console.error("Error fetching user info:", error));
        }
    }, [user?.email]);

    // Fetch user bookings
    useEffect(() => {
        axios.get("/bookings")
            .then(response => setBookings(response.data))
            .catch(error => console.error("Error fetching bookings:", error));
    }, []);

    async function logout() {
        await axios.post("/logout");
        setRedirect("/");
        setUser(null);
    }

    if (!ready) {
        return "Loading . . .";
    }

    if (ready && !user && !redirect) {
        return <Navigate to={"/login"} />;
    }
    if (redirect) {
        return <Navigate to={redirect} />;
    }

    return (
        <div>
            <AccountNav />
            {subpage === "profile" && (
                <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                    {/* Profile Section */}
                    <div className="flex items-center space-x-6">
                        {/* SVG Person Icon */}
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 0115 0" />
                            </svg>
                        </div>

                        {/* User Details */}
                        <div>
                            <h1 className="text-2xl font-semibold">{userInfo?.name || "User Name"}</h1>
                            <p className="text-gray-500">{userInfo?.profession || "Profession"}</p>
                            <p className="text-gray-700">Age: {userInfo?.age || "--"} years</p>
                            <p className="text-blue-500">
                                <a href={userInfo?.socialMediaID || "#"} target="_blank" rel="noopener noreferrer">
                                {userInfo?.socialMediaID ? "Social Media Profile" : "No Social Media Added"}
                                </a>
                            </p>
                            <p className="text-gray-600">{userInfo?.email || "email@example.com"}</p>
                            <p className="text-gray-700">
                                {userInfo?.addressLine1 || "Address Line 1"}, {userInfo?.addressLine2 || "Address Line 2"}, {userInfo?.addressLine3 || "Address Line 3"}
                            </p>
                            <p className="font-bold">Personality Category: <span className="text-blue-600">{userInfo?.personalityCategory || 5}</span></p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="text-center mt-6">
                        <button onClick={logout} className="primary max-w-sm">Logout</button>
                    </div>

                    {/* Previous Bookings */}
                    <h2 className="text-xl font-semibold mt-8">Previous Bookings</h2>
                    <div className="flex overflow-x-auto space-x-4 mt-4 p-2">
                        {bookings.length > 0 ? (
                            bookings.map(booking => (
                                <div key={booking._id} className="w-64 bg-gray-100 p-4 rounded-lg shadow-md">
                                    {booking.place?.photos?.length > 0 && (
                                        <img src={`http://localhost:4000/uploads/${booking.place.photos[0]}`} alt="Place" className="w-full h-32 object-cover rounded-md" />
                                    )}
                                    <h3 className="font-semibold text-lg mt-2">{booking.place?.title || "Booking Title"}</h3>
                                    <p className="text-gray-500">{new Date(booking.checkIn).toLocaleDateString()}</p>
                                    <p className="text-gray-700 font-semibold">₹{booking.priceSelectedByUser}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No previous bookings.</p>
                        )}
                    </div>
                </div>
            )}

            {subpage === "places" && <PlacesPage />}
        </div>
    );
}