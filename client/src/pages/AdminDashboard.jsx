import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import AdminUserManagement from "../AdminUserManagement";
import AdminBookingManagement from "../AdminBookingManagement";
import AdminPlacesManagement from "../AdminPlacesManagement";
import AccountNav from "../AccountNav";

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem("token"); //Get JWT token
 
            if (!token) {
                console.error("No token found in local storage");
                setIsAdmin(false);
                setLoading(false);
                return;     
            }

            try {
                const response = await axios.get("https://travelling-buddy.onrender.com/is-admin", {
                    headers: {
                        Authorization: `Bearer ${token}` //Attach token here
                    }
                });
                setIsAdmin(response.data.isAdmin);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Checking access...</p>;
    if (isAdmin === false) return <Navigate to="/" />;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <AccountNav />
            <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
            <p className="text-gray-700 text-center mt-4">Welcome, Admin! Manage users, bookings, and places here.</p>
            
            <AdminUserManagement />
            <AdminBookingManagement />
            <AdminPlacesManagement />
        </div>
    );
}