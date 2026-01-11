import { Link } from "react-router-dom";

export default function FeatureCard({ icon, title, description,to}) {
  return (
    <Link to={to}>
    <div className="feature-card bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
      <div className="feature-icon text-3xl mb-4 bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent">
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
    </Link>
  );
}
