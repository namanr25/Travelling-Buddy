import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import axios from "axios";

export default function PlacesPage() {
    const [places, setPlaces] = useState([]);

    // Fetch places from the backend
    useEffect(() => {
        axios.get('/places')
            .then(({ data }) => {
                setPlaces(data);
            })
            .catch(error => {
                console.error("❌ Error fetching places:", error);
            });
    }, []);

    return (
        <div>
            <AccountNav />
            <div className="text-center">
                <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to="/account/places/new">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add New Place
                </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {places.length > 0 ? (
                    places.map(place => (
                        <Link 
                            key={place._id} 
                            to={`/account/places/${place._id}`} 
                            className="flex flex-col bg-gray-100 p-4 rounded-2xl hover:shadow-lg transition"
                        >
                            {/* Display Place Image */}
                            <div className="w-full h-40 bg-gray-300 flex items-center justify-center rounded-lg overflow-hidden">
                                {place.photos?.length > 0 ? (
                                    <img 
                                        className="w-full h-full object-cover" 
                                        src={`http://localhost:4000/uploads/${place.photos[0]}`} 
                                        alt={place.title} 
                                    />
                                ) : (
                                    <span className="text-gray-500">No Image</span>
                                )}
                            </div>

                            {/* Place Information */}
                            <h2 className="text-xl font-semibold mt-2">{place.title}</h2>
                            <p className="text-sm text-gray-600 mt-1">{place.locationsToVisit || "No specific locations mentioned"}</p>
                            <p className="text-sm mt-2">{place.description}</p>
                            <p className="text-lg font-semibold mt-2">Price: ₹{place.basePrice}</p>
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-4">No places added yet.</p>
                )}
            </div>
        </div>
    );
}