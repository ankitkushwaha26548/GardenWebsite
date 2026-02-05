import { Link } from "react-router-dom";

export default function FeatureCard({ icon, title, description, to }) {
  return (
    <Link to={to} className="h-full">
      <div className="feature-card bg-white p-4 sm:p-6 rounded-lg sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
        <div className="feature-icon text-2xl sm:text-3xl mb-3 sm:mb-4 bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent">
          <i className={`fas ${icon}`}></i>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 flex-grow line-clamp-3">{description}</p>
      </div>
    </Link>
  );
}
