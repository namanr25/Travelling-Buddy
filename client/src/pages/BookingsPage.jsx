import AccountNav from "../AccountNav";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const { user } = useContext(UserContext);
    const [reviewedBookings, setReviewedBookings] = useState({}); 

    useEffect(() => {
        axios.get('/bookings')
            .then(response => {
                setBookings(response.data);
                checkReviews(response.data);
            })
            .catch(error => {
                console.error("Error fetching bookings:", error);
            });
    }, []);

    //Function to check if user has reviewed a place
    async function checkReviews(bookingsData) {
        let reviewedStatus = {};
        for (let booking of bookingsData) {
            try {
                const response = await axios.get(`/places/${booking.place._id}/reviews`);
                const hasReviewed = response.data.some(review => review.userId._id === user?._id);
                reviewedStatus[booking._id] = hasReviewed;
            } catch (error) {
                console.error("Error checking reviews:", error);
            }
        }
        setReviewedBookings(reviewedStatus); 
    }

    function getPriceCategory(booking) {
        if (!booking.place || !booking.place.priceToOutput) return "Unknown";

        if (booking.priceSelectedByUser === booking.place.priceToOutput.economy) return "Economy";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) return "Medium";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) return "Luxury";

        return "Custom Price";
    }

    function calculateCheckOutDate(booking) {
        if (!booking.checkIn || !booking.place || !booking.place.priceToOutput) return "N/A";

        let daysToAdd = 3;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) daysToAdd = 4;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) daysToAdd = 5;

        const checkInDate = new Date(booking.checkIn);
        checkInDate.setDate(checkInDate.getDate() + daysToAdd);
        return checkInDate;
    }

    return (
        <div>
            <AccountNav />
            <div className="space-y-6">
                {bookings?.length > 0 ? (
                    bookings.map(booking => {
                        const checkOutDate = calculateCheckOutDate(booking);
                        const isTripCompleted = checkOutDate < new Date();
                        const hasReviewed = reviewedBookings[booking._id] || false;

                        return (
                            <Link 
                                key={booking._id}  
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
                                        <strong>Check-out:</strong> {checkOutDate.toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-1 items-center mt-3">
                                        <span className="text-2xl font-bold">₹{booking.priceSelectedByUser}</span>
                                    </div>
                                    <p className="text-gray-700 mt-2">
                                        <strong>Category:</strong> {getPriceCategory(booking)}
                                    </p>
                                    {isTripCompleted && !hasReviewed && (
                                        <div className="bg-yellow-100 p-3 mt-2 rounded-md text-yellow-800">
                                             Your trip to <strong>{booking.place?.title}</strong> has ended! <br />
                                            <Link to={`/account/bookings/${booking._id}`} className="text-blue-600 underline">Write a Review</Link>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 mt-6">No bookings found.</p>
                )}
            </div>
        </div>
    );
}