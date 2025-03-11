import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [priceCategory, setPriceCategory] = useState("economic");
  const [priceSelectedByUser, setPriceSelectedByUser] = useState(place.basePrice);
  const [tripDuration, setTripDuration] = useState(3);
  const [redirect, setRedirect] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    setPriceSelectedByUser(place.basePrice); 
    setTripDuration(3);
  }, [place.basePrice]);

  function handlePriceChange(category) {
    setPriceCategory(category);

    if (category === "economic") {
      setPriceSelectedByUser(place.priceToOutput?.economy || 0);
      setTripDuration(3);
    }
    if (category === "medium") {
      setPriceSelectedByUser(place.priceToOutput?.medium || 0);
      setTripDuration(4);
    }
    if (category === "luxury") {
      setPriceSelectedByUser(place.priceToOutput?.luxury || 0);
      setTripDuration(5);
    }
  }

  async function bookThisPlace() {
    if (!checkIn) {
      alert("Please select a check-in date.");
      return;
    }

    try {
      const response = await axios.post("/bookings", {
        place: place._id, 
        checkIn,
        priceSelectedByUser,
      });

      if (response.data.message.includes("Booking created successfully")) {
        alert("Booking successful!");
      } else if (response.data.message.includes("You have been added")) {
        alert("You have been added to an existing booking.");
      }

      setRedirect(`/account/bookings/${response.data.bookingId}`);

    } catch (error) {
      console.error(" Booking failed", error);

      if (error.response?.status === 409) {
        const proceed = window.confirm("You have already booked this trip. Do you want to view your booking?");
        if (proceed) {
          setRedirect(`/account/bookings/${error.response.data.bookingId}`);
        }
      } else {
        alert("An error occurred while booking. Please try again.");
      }
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow-lg p-6 rounded-2xl text-center">
      <h2 className="text-2xl font-bold mb-4">Select Check-in Date</h2>
      <div className="flex justify-center">
        <input 
          type="date" 
          value={checkIn} 
          onChange={(ev) => setCheckIn(ev.target.value)} 
          className="border rounded-lg p-2 text-center"
        />
      </div>

      <h2 className="text-2xl font-bold mt-6 mb-2">Select Price Category</h2>
      <div className="flex justify-center gap-4 mt-2">
        <button 
          className={`px-6 py-3 rounded-full ${
            priceCategory === "economic" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => handlePriceChange("economic")}
        >
          Economy ₹{place.priceToOutput?.economy || "N/A"}
        </button>
        <button 
          className={`px-6 py-3 rounded-full ${
            priceCategory === "medium" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => handlePriceChange("medium")}
        >
          Medium ₹{place.priceToOutput?.medium || "N/A"}
        </button>
        <button 
          className={`px-6 py-3 rounded-full ${
            priceCategory === "luxury" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => handlePriceChange("luxury")}
        >
          Luxury ₹{place.priceToOutput?.luxury || "N/A"}
        </button>
      </div>

      <div className="text-xl font-semibold mt-6">Selected Price: ₹{priceSelectedByUser}</div>
      <div className="text-lg text-gray-600 mt-1">Trip Duration: {tripDuration} days</div>

      <button 
        onClick={bookThisPlace} 
        className="mt-6 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 transition"
      >
        Book this place
      </button>
    </div>
  );
}