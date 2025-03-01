
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get("/admin/bookings")
            .then(response => setBookings(response.data))
            .catch(error => console.error("Error fetching bookings:", error));
    }, []);

    function deleteBooking(bookingId) {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            axios.delete(`/admin/bookings/${bookingId}`)
                .then(() => setBookings(bookings.filter(booking => booking._id !== bookingId)))
                .catch(error => console.error("Error deleting booking:", error));
        }
    }

    const filteredBookings = bookings.filter(booking =>
        booking.place?.title.toLowerCase().includes(search.toLowerCase()) ||
        new Date(booking.checkIn).toLocaleDateString().includes(search)
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-4">Bookings Management</h1>
            <input 
                type="text" 
                placeholder="Search by place or date..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full p-2 border rounded-lg mb-4"
            />
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Place</th>
                        <th className="border p-2">Check-in Date</th>
                        <th className="border p-2">Users</th>
                        <th className="border p-2">Personality Distribution</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map(booking => (
                        <tr key={booking._id} className="text-center">
                            <td className="border p-2">{booking.place?.title || "Unknown"}</td>
                            <td className="border p-2">{new Date(booking.checkIn).toLocaleDateString()}</td>
                            <td className="border p-2">
                                {booking.users.map(user => (
                                    <p key={user._id}>{user.name} ({user.email})</p>
                                ))}
                            </td>
                            <td className="border p-2">
                                {Object.entries(
                                    booking.users.reduce((acc, user) => {
                                        acc[user.personalityCategory] = (acc[user.personalityCategory] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([category, count]) => (
                                    <p key={category}>{category}: {count}</p>
                                ))}
                            </td>
                            <td className="border p-2">
                                <button onClick={() => deleteBooking(booking._id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
