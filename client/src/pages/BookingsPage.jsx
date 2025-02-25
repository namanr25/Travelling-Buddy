import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { Link } from "react-router-dom";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        axios.get('/bookings')
            .then(response => {
                setBookings(response.data);
            })
            .catch(error => {
                console.error("❌ Error fetching bookings:", error);
            });
    }, []);

    // ✅ Function to get the correct price category from the place model
    function getPriceCategory(booking) {
        if (!booking.place || !booking.place.priceToOutput) return "Unknown";

        if (booking.priceSelectedByUser === booking.place.priceToOutput.economy) return "Economy";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) return "Medium";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) return "Luxury";
        
        return "Custom Price"; // In case user manually enters another amount
    }

    // ✅ Function to calculate check-out date based on selected price
    function calculateCheckOutDate(booking) {
        if (!booking.checkIn || !booking.place || !booking.place.priceToOutput) return "N/A";

        let daysToAdd = 3; // Default: Economy

        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) daysToAdd = 4;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) daysToAdd = 5;

        const checkInDate = new Date(booking.checkIn);
        checkInDate.setDate(checkInDate.getDate() + daysToAdd);
        return checkInDate.toLocaleDateString();
    }

    return (
        <div>
            <AccountNav />
            <div>
                {bookings?.length > 0 ? (
                    bookings.map(booking => (
                        <Link 
                            key={booking._id}  // ✅ Using MongoDB _id for navigation
                            to={`/account/bookings/${booking._id}`}  
                            className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden p-4"
                        >
                            <div className="w-48">
                                <PlaceImg place={booking.place} />
                            </div>
                            <div className="py-3 pr-3 grow">
                                <h2 className="text-xl font-semibold">{booking.place?.title || "Unknown Place"}</h2>
                                <p className="text-gray-600 mt-2">
                                    <strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Check-out:</strong> {calculateCheckOutDate(booking)}
                                </p>
                                <div className="flex gap-1 items-center mt-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                    <span className="text-2xl font-bold">₹{booking.priceSelectedByUser}</span>
                                </div>
                                <p className="text-gray-700 mt-2">
                                    <strong>Category:</strong> {getPriceCategory(booking)}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-6">No bookings found.</p>
                )}
            </div>
        </div>
    );
}