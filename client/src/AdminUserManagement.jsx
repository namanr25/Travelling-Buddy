import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get("/admin/users")
            .then(response => setUsers(response.data))
            .catch(error => console.error("Error fetching users:", error));
    }, []);

    function deleteUser(userId) {
        if (window.confirm("Are you sure you want to delete this user?")) {
            axios.delete(`/admin/users/${userId}`)
                .then(() => setUsers(users.filter(user => user._id !== userId)))
                .catch(error => console.error("Error deleting user:", error));
        }
    }

    function resetPersonality(userId) {
        if (window.confirm("Reset this user's personality test?")) {
            axios.put(`/admin/users/${userId}/reset-personality`)
                .then(() => {
                    setUsers(users.map(user => user._id === userId ? { ...user, personalityCategory: null } : user));
                })
                .catch(error => console.error("Error resetting personality test:", error));
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.personalityCategory && user.personalityCategory.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-4">User Management</h1>
            <input 
                type="text" 
                placeholder="Search users..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full p-2 border rounded-lg mb-4"
            />
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Personality Category</th>
                        <th className="border p-2">Bookings</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id} className="text-center">
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.personalityCategory || "Not Assigned"}</td>
                            <td className="border p-2">{user.bookingIds.length}</td>
                            <td className="border p-2">
                                <button onClick={() => resetPersonality(user._id)} className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2">Reset</button>
                                <button onClick={() => deleteUser(user._id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}