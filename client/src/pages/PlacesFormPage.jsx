import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";
import PhotosUploader from "../PhotosUploader.jsx";
import Perks from "../Perks.jsx";

export default function PlacesFormPage() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [locationsToVisit, setLocationsToVisit] = useState("");
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [description, setDescription] = useState("");
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState("");
    const [priceToOutput, setPriceToOutput] = useState({ economy: 0, medium: 0, luxury: 0 });
    const [basePrice, setBasePrice] = useState(0);
    const [itinerary, setItinerary] = useState({
        economy: Array(3).fill({ day: 0, activity: "" }),
        medium: Array(4).fill({ day: 0, activity: "" }),
        luxury: Array(5).fill({ day: 0, activity: "" })
    });
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!id) return;
        axios.get(`/places/${id}`).then(response => {
            const data = response.data;
            setTitle(data.title);
            setLocationsToVisit(data.locationsToVisit);
            setAddedPhotos(data.photos);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extraInfo);
            setPriceToOutput(data.priceToOutput);
            setBasePrice(data.priceToOutput?.economy || 0);
            setItinerary(data.itinerary || itinerary);
        });
    }, [id]);

    function handleItineraryChange(category, index, value) {
        setItinerary(prev => {
            const updated = [...prev[category]];
            updated[index] = { day: index + 1, activity: value };
            return { ...prev, [category]: updated };
        });
    }

    function inputHeader(text) {
        return <h2 className="font-bold text-2xl mt-4">{text}</h2>;
    }

    function inputDescription(text) {
        return <p className="text-gray-500 text-sm">{text}</p>;
    }

    function preInput(header, description) {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        );
    }

    async function savePlace(ev) {
        ev.preventDefault();
        const placeData = {
            title,
            locationsToVisit,
            addedPhotos,
            description,
            perks,
            extraInfo,
            priceToOutput,
            basePrice: priceToOutput.economy,
            itinerary
        };
        try {
            if (id) {
                await axios.put(`/places/${id}`, placeData);
            } else {
                await axios.post("/places", placeData, { withCredentials: true });
            }
            setRedirect(true);
        } catch (error) {
            alert("❌ Error saving place. Please try again.");
            console.error("Error:", error);
        }
    }

    if (redirect) {
        return <Navigate to={"/admin"} />;
    }

    function renderItineraryInputs(category) {
        return itinerary[category].map((item, index) => (
            <div key={index}>
                <h4 className="font-bold">Day {index + 1}</h4>
                <input
                    type="text"
                    value={item.activity}
                    onChange={(ev) => handleItineraryChange(category, index, ev.target.value)}
                    placeholder={`Activity for Day ${index + 1}`}
                />
            </div>
        ));
    }

    return (
        <div>
            <AccountNav />
            <form onSubmit={savePlace}>
                {preInput("Title", "A short, catchy title for your place.")}
                <input type="text" value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder="Title" />

                {preInput("Locations to Visit", "Nearby attractions or landmarks.")}
                <input type="text" value={locationsToVisit} onChange={(ev) => setLocationsToVisit(ev.target.value)} placeholder="City or area" />

                {preInput("Photos", "Add beautiful images of your place.")}
                <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

                {preInput("Description", "Provide a detailed description of your place.")}
                <textarea value={description} onChange={(ev) => setDescription(ev.target.value)} />

                {preInput("Perks", "Select the available perks at your place.")}
                <Perks selected={perks} onChange={setPerks} />

                {preInput("Extra Information", "Any additional details or house rules.")}
                <textarea value={extraInfo} onChange={(ev) => setExtraInfo(ev.target.value)} />

                {preInput("Pricing", "Set different price categories.")}
                <div className="grid gap-2 grid-cols-3">
                    {Object.keys(priceToOutput).map((category) => (
                        <div key={category}>
                            <h3 className="font-bold">{category.charAt(0).toUpperCase() + category.slice(1)} Price</h3>
                            <input
                                type="number"
                                value={priceToOutput[category]}
                                onChange={(ev) => setPriceToOutput(prev => ({ ...prev, [category]: Number(ev.target.value) }))}
                                placeholder={`${category} price`}
                            />
                        </div>
                    ))}
                </div>

                {preInput("Itinerary", "Add daily activities for each pricing category.")}
                {Object.keys(itinerary).map((category) => (
                    <div key={category}>
                        <h3 className="font-bold">{category.charAt(0).toUpperCase() + category.slice(1)} Itinerary</h3>
                        {renderItineraryInputs(category)}
                    </div>
                ))}

                <button className="primary my-4">Save</button>
            </form>
        </div>
    );
}