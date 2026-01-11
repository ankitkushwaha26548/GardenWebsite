import FeatureCard from "./FeatureCard";
import HeroSection from "./HeroSection";


export default function Home() {
  return (
    <>
      <div className="demo-content max-w-6xl mx-auto px-4 py-10 text-center">
      <h1 className="demo-title text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent mb-4 leading-relaxed">
        Plant Care Tools & Gardening Solutions
      </h1>
        <p className="demo-subtitle text-gray-700 text-lg">
          Learn, grow, and connect <br />Leafline brings gardening knowledge and inspiration to every doorstep.
      </p>

      <div className="feature-grid grid gap-6 mt-10 sm:grid-cols-2 md:grid-cols-3">

      <FeatureCard
        icon="fa-seedling"
        title="Care Guides & Tips"
        description="Access step-by-step guides for nurturing healthy, thriving plants"
        to="/guides"
      />

      <FeatureCard
        icon="fa-database"
        title="Plant Database"
        description="Explore detailed profiles of plants with care instructions, climate needs, and more"
        to="/plantdatabase"
      />

      <FeatureCard
        icon="fa-calendar"
        title="Plant Calendar"
        description="Plan to watering, fertilizing, and seasonal activities with personalized reminders"
        to="/calendar"
      />
  
      </div>


      </div>

      {/* Hero Section */}
      <div>
        <HeroSection />
      </div>

    </>
  );
}
