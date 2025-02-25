export default function Image({ src, ...rest }) {
    src = src?.includes("https://") ? src : `http://localhost:4000/uploads/${src}`;
    return <img {...rest} src={src} alt="Image" className="w-full h-full object-cover rounded-lg" />;
  }