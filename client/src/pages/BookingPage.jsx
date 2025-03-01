import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";

export default function BookingPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (!id) return;
        axios.get(`/bookings/${id}`)
            .then(response => {
                console.log("✅ Booking Found:", response.data);
                setBooking(response.data);
            })
            .catch(error => console.error("❌ Error fetching booking:", error));
    }, [id]);

    if (!booking) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    function calculateCheckOutDate() {
        if (!booking.checkIn || !booking.place || !booking.place.priceToOutput) return "N/A";
        let daysToAdd = 3;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) daysToAdd = 4;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) daysToAdd = 5;
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setDate(checkInDate.getDate() + daysToAdd);
        return checkInDate.toLocaleDateString();
    }

    function getPriceCategory() {
        if (!booking.place || !booking.place.priceToOutput) return "Unknown";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.economy) return "Economy";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) return "Medium";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) return "Luxury";
        return "Custom Price";
    }

    function getItinerary() {
        const category = getPriceCategory().toLowerCase();
        return booking.place?.itinerary?.[category] || [];
    }

    return (
        <div className="my-8">
            <h1 className="text-3xl font-bold">{booking.place?.title || "Unknown Place"}</h1>
            <p className="text-gray-600 text-lg mt-2">{booking.place?.locationsToVisit || "Location not specified"}</p>
            <AddressLink className="my-2 block">
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.place?.title || "Unknown Location")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    View on Google Maps
                </a>
            </AddressLink>

            <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl mb-4">Your Booking Information:</h2>
                    <p className="text-gray-600"><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                    <p className="text-gray-600"><strong>Check-out:</strong> {calculateCheckOutDate()}</p>
                </div>
                <div className="bg-primary p-6 text-white rounded-2xl text-center">
                    <div className="text-lg">Total Price</div>
                    <div className="text-3xl font-bold">₹{booking.priceSelectedByUser || "N/A"}</div>
                    <div className="text-md mt-1">Category: {getPriceCategory()}</div>
                </div>
            </div>

            {booking.place?.photos?.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Place Photos</h2>
                    <PlaceGallery place={booking.place} />
                </>
            )}

            {booking.place?.description && (
                <div className="bg-gray-100 p-6 my-6 rounded-2xl">
                    <h2 className="text-2xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-700">{booking.place.description}</p>
                </div>
            )}

            <div className="bg-gray-100 p-6 my-6 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-2">Itinerary ({getPriceCategory()})</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {getItinerary().map((item, index) => (
                        <li key={index} className="ml-4">
                            <strong>Day {item.day}:</strong> {item.activity}
                        </li>
                    ))}
                </ul>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Travel Buddies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booking.users.length > 1 ? (
                    booking.users.map((user) => (
                        <Link key={user._id} to={`/user-profile/${user.email}`} className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center gap-4 hover:bg-gray-200 transition">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 0115 0" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-blue-600 underline">{user.name}</p>
                                <p className="text-gray-500">{user.email}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-500">No other travelers associated with this trip.</p>
                )}
            </div>
        </div>
    );
}