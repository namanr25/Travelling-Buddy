export default function Image({ src, ...rest }) {
    src = src?.includes("https://") ? src : `https://travelling-buddy.onrender.com/uploads/${src}`;
    return <img {...rest} src={src} alt="Image" className="w-full h-full object-cover rounded-lg" />;
  }