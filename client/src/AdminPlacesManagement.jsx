import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AdminPlacesManagement() {
    const [places, setPlaces] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get("/admin/places")
            .then(response => setPlaces(response.data))
            .catch(error => console.error("Error fetching places:", error));
    }, []);

    function deletePlace(placeId) {
        if (window.confirm("Are you sure you want to delete this place?")) {
            axios.delete(`/admin/places/${placeId}`)
                .then(() => setPlaces(places.filter(place => place._id !== placeId)))
                .catch(error => console.error("Error deleting place:", error));
        }
    }

    const filteredPlaces = places.filter(place =>
        place.title.toLowerCase().includes(search.toLowerCase()) ||
        place.locationsToVisit.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-4">Places Management</h1>
            <input 
                type="text" 
                placeholder="Search by title or location..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full p-2 border rounded-lg mb-4"
            />
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Location</th>
                        <th className="border p-2">Pricing</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPlaces.map(place => (
                        <tr key={place._id} className="text-center">
                            <td className="border p-2">{place.title}</td>
                            <td className="border p-2">{place.locationsToVisit}</td>
                            <td className="border p-2">
                                Economy: ₹{place.priceToOutput.economy} <br/>
                                Medium: ₹{place.priceToOutput.medium} <br/>
                                Luxury: ₹{place.priceToOutput.luxury}
                            </td>
                            <td className="border p-2 flex justify-center gap-2">
                                <Link to={`/account/places/${place._id}`} className="bg-blue-500 text-white px-3 py-1 rounded-md">Edit</Link>
                                <button onClick={() => deletePlace(place._id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-6">
                <Link to="/account/places/new" className="bg-primary text-white px-6 py-2 rounded-md">Add New Place</Link>
            </div>
        </div>
    );
}