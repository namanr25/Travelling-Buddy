import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";

export default function PlacePage() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);

    // Fetch place details from the backend
    useEffect(() => {
        if (!id) return;
    
        console.log("📢 Fetching place with ID:", id);  // Debugging Log
    
        axios.get(`/places/${id}`)
            .then(response => {
                console.log("✅ Fetched Place Data:", response.data); // Debugging Log
                setPlace(response.data);
            })
            .catch(error => {
                console.error("❌ Error fetching place:", error.response?.data || error.message);
            });
    }, [id]);

    if (!place) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
            {/* Title and Location */}
            <h1 className="text-3xl font-bold">{place.title}</h1>
            <AddressLink>{place.locationsToVisit || "Location not specified"}</AddressLink>
            
            {/* Image Gallery */}
            <PlaceGallery place={place} />

            {/* Pricing and Booking */}
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    {/* Description */}
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        <p className="text-gray-700">{place.description || "No description available."}</p>
                    </div>

                    {/* Pricing Details */}
                    <h2 className="font-semibold text-2xl mt-4">Pricing</h2>
                    <p><strong>Economy:</strong> ₹{place.priceToOutput?.economy || "N/A"}</p>
                    <p><strong>Medium:</strong> ₹{place.priceToOutput?.medium || "N/A"}</p>
                    <p><strong>Luxury:</strong> ₹{place.priceToOutput?.luxury || "N/A"}</p>
                    <p className="text-lg font-bold mt-2">Base Price: ₹{place.basePrice || "N/A"}</p>
                </div>

                {/* Booking Widget */}
                <div>
                    <BookingWidget place={place} />
                </div>
            </div>

            {/* Extra Information */}
            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <h2 className="font-semibold text-2xl">Extra Information</h2>
                <p className="mt-2 text-sm text-gray-700 leading-5">{place.extraInfo || "No additional information provided."}</p>
            </div>
        </div>
    );
}