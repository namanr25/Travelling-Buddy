import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";

export default function PlacePage() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        axios.get(`/places/${id}`)
            .then(response => {
                setPlace(response.data);
            })
            .catch(error => console.error("Error fetching place:", error));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        axios.get(`/places/${id}/reviews`)
            .then(response => {
                setReviews(response.data);
            })
            .catch(error => console.error("Error fetching reviews:", error));
    }, [id]);

    if (!place) return <p className="text-center text-gray-500">Loading...</p>;

    function handleNext() {
        setCurrentIndex(prev => (prev + 1) % reviews.length);
    }

    function handlePrev() {
        setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    }

    function formatItinerary(itinerary) {
        return itinerary.map((item, index) => (
            <div key={index} className="mt-2">
                <h4 className="font-bold text-lg">Day {item.day}</h4>
                <p className="text-gray-700 whitespace-pre-line">• {item.activity}</p>
            </div>
        ));
    }

    return (
        <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
            <h1 className="text-3xl font-bold">{place.title}</h1>
            <AddressLink>{place.locationsToVisit || "Location not specified"}</AddressLink>
            <PlaceGallery place={place} />

            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <h2 className="font-semibold text-2xl mt-4">Description</h2>
                    <p className="text-gray-700">{place.description || "No description available."}</p>
                    
                    <h2 className="font-semibold text-2xl mt-4">Itineraries</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-80">
                            <h3 className="font-bold text-xl">Economy</h3>
                            {formatItinerary(place.itinerary?.economy || [])}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-80">
                            <h3 className="font-bold text-xl">Medium</h3>
                            {formatItinerary(place.itinerary?.medium || [])}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-80">
                            <h3 className="font-bold text-xl">Luxury</h3>
                            {formatItinerary(place.itinerary?.luxury || [])}
                        </div>
                    </div>
                </div>
                <div>
                    <BookingWidget place={place} />
                </div>
            </div>

            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <h2 className="font-semibold text-2xl">Extra Information</h2>
                <p className="mt-2 text-sm text-gray-700 leading-5">{place.extraInfo || "No additional information provided."}</p>
            </div>

            {/* Review Section */}
            <div className="bg-white -mx-8 px-8 py-8 border-t mt-8">
                <h2 className="font-semibold text-2xl">User Reviews</h2>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 mt-4">No reviews yet! Be the first to review this place.</p>
                ) : (
                    <div className="relative mt-6">
                        <div className="flex overflow-hidden w-full">
                            {reviews.slice(currentIndex, currentIndex + 3).map((review, index) => (
                                <div key={index} className="bg-gray-100 p-4 m-2 rounded-lg shadow-md w-1/3">
                                    <h3 className="font-bold text-lg">{review.userId?.name || "Unknown User"}</h3>
                                    <p className="text-yellow-500 text-lg">{'⭐'.repeat(review.rating)}</p>
                                    <p className="text-gray-700 mt-2">{review.reviewText}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300"
                        >
                            ◀
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300"
                        >
                            ▶
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}