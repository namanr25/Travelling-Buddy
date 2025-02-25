import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function IndexPage() {
    const [places, setPlaces] = useState([]);

    // Fetch places from the backend
    useEffect(() => {
        axios.get('/places')
            .then(response => {
                console.log("✅ Fetched Places Data:", response.data); // Debugging log
                setPlaces(response.data);
            })
            .catch(error => {
                console.error("❌ Error fetching places:", error);
            });
    }, []);

    return (
        <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {places.length > 0 ? (
                places.map(place => (
                    <Link key={place._id} to={`/place/${place._id}`} className="block">
                        {/* Image Container */}
                        <div className="bg-gray-500 mb-2 rounded-2xl flex overflow-hidden">
                            {place.photos?.[0] ? (
                                <img 
                                    className="rounded-2xl object-cover aspect-square w-full" 
                                    src={`http://localhost:4000/uploads/${place.photos[0]}`} 
                                    alt={place.title} 
                                />
                            ) : (
                                <div className="w-full h-32 flex items-center justify-center bg-gray-300 text-gray-500">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="font-bold text-lg text-center">{place.title}</h2>

                        {/* Price */}
                        <div className="mt-1 text-lg font-semibold text-center">
                            <span>₹{place.basePrice || "N/A"}</span>
                        </div>
                    </Link>
                ))
            ) : (
                <p className="text-center text-gray-500 col-span-3">No places available.</p>
            )}
        </div>
    );
}