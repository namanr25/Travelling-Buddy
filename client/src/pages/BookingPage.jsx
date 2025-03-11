
import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function BookingPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [reviewed, setReviewed] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(0);
    const [submittedReview, setSubmittedReview] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!id) return;
        axios.get(`/bookings/${id}`)
            .then(response => {
                setBooking(response.data);
                checkIfReviewed(response.data);
            })
            .catch(error => console.error("Error fetching booking:", error));
    }, [id]);

    function checkIfReviewed(booking) {
        if (!booking?.place?._id || !user?._id) return;
        axios.get(`/places/${booking.place._id}/reviews`)
            .then(response => {
                const userReview = response.data.find(r => r.userId._id === user._id);
                if (userReview) {
                    setReviewed(true);
                    setSubmittedReview(userReview);
                    setRating(userReview.rating);
                    setReviewText(userReview.reviewText);
                }
            })
            .catch(error => console.error("Error checking reviews:", error));
    }

    function handleSubmitReview() {
        if (!user || !user._id) {
            console.error("No logged-in user found!");
            return;
        }
    
        if (!reviewText.trim()) {
            console.error("Review text cannot be empty!");
            return;
        }
    
        // If the user has already submitted a review, update it (PUT)
        if (submittedReview) {
            axios.put(`/places/${booking.place._id}/reviews/${submittedReview._id}`, {
                userId: user._id,
                rating,
                reviewText
            }).then(response => {
                console.log("Review updated successfully:", response.data);
                setReviewed(true);
                setSubmittedReview({ ...submittedReview, rating, reviewText });
            }).catch(error => console.error("Error editing review:", error));
        } else {
            // If no review exists, create a new review (POST)
            axios.post(`/places/${booking.place._id}/reviews`, {
                userId: user._id,
                rating,
                reviewText
            }).then(response => {
                console.log("Review added successfully:", response.data);
                setReviewed(true);
                setSubmittedReview(response.data); 
            }).catch(error => console.error("Error submitting review:", error));
        }
    }

    function handleEditReview() {
        setReviewed(false); 
    }

    function handleDeleteReview() {
        axios.delete(`/places/${booking.place._id}/reviews/${submittedReview._id}`, {
            data: { userId: user._id }
        }).then(() => {
            setReviewed(false);
            setSubmittedReview(null);
            setRating(0);
            setReviewText("");
        }).catch(error => console.error("Error deleting review:", error));
    }

    function calculateCheckOutDate() {
        if (!booking?.checkIn || !booking?.place?.priceToOutput) return "N/A";
        let daysToAdd = 3;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) daysToAdd = 4;
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) daysToAdd = 5;
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setDate(checkInDate.getDate() + daysToAdd);
        return checkInDate.toLocaleDateString();
    }

    function getPriceCategory() {
        if (!booking?.place?.priceToOutput) return "Unknown";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.economy) return "Economy";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.medium) return "Medium";
        if (booking.priceSelectedByUser === booking.place.priceToOutput.luxury) return "Luxury";
        return "Custom Price";
    }

    function getItinerary() {
        const category = getPriceCategory().toLowerCase();
        return booking?.place?.itinerary?.[category] || [];
    }

    if (!booking) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    return (
        <div className="my-8">
            <h1 className="text-3xl font-bold">{booking?.place?.title || "Unknown Place"}</h1>
            <p className="text-gray-600 text-lg mt-2">{booking?.place?.locationsToVisit || "Location not specified"}</p>
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
            <div className="bg-gray-100 p-6 my-6 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-2">Your Review</h2>
                {reviewed ? (
                    <div>
                        <p className="text-lg">⭐ {submittedReview.rating} Stars</p>
                        <p className="text-gray-700 mt-2">{submittedReview.reviewText}</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleEditReview}>Edit</button>
                        <button className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleDeleteReview}>Delete</button>
                    </div>
                ) : (
                    <div>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    className={`cursor-pointer text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea className="w-full p-2 border rounded-md" maxLength={200} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write your review here (max 200 words)..." />
                        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleSubmitReview}>Submit Review</button>
                    </div>
                )}
            </div>
        </div>
    );
}
