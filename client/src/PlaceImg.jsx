import Image from "./Image.jsx";

export default function PlaceImg({ place, index = 0, className = "object-cover w-full h-full rounded-lg" }) {
  if (!place.photos?.length) {
    return <p className="text-gray-500">No image available</p>;
  }

  return (
    <div className="w-full h-48 sm:h-64 md:h-72 lg:h-80">
      <Image className={className} src={place.photos[index]} alt={`Place Image ${index + 1}`} />
    </div>
  );
}