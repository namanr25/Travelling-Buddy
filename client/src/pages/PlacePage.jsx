import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";

export default function PlacePage() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);

    useEffect(() => {
        if (!id) return;
    
        console.log("📢 Fetching place with ID:", id);
    
        axios.get(`/places/${id}`)
            .then(response => {
                console.log("✅ Fetched Place Data:", response.data);
                setPlace(response.data);
            })
            .catch(error => {
                console.error("❌ Error fetching place:", error.response?.data || error.message);
            });
    }, [id]);

    if (!place) return <p className="text-center text-gray-500">Loading...</p>;

    function formatItinerary(itinerary) {
        return itinerary.map((item, index) => (
            <div key={index} className="mt-2">
                <h4 className="font-bold text-lg">Day {item.day}</h4>
                <p className="text-gray-700 whitespace-pre-line">• {item.activity.split('. ').join('\n• ')}</p>
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
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        <p className="text-gray-700">{place.description || "No description available."}</p>
                    </div>
                    
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
        </div>
    );
}