export default function FilterPanel({ filters, setFilters }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg space-y-4 border border-green-200 
                transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">

      <h2 className="text-lg font-semibold text-green-700">Filter Plants</h2>

      <select
        value={filters.sunlight}
        onChange={(e) => setFilters({ ...filters, sunlight: e.target.value })}
        className="w-full border rounded-xl p-2 bg-white
           focus:outline-none focus:ring-2 focus:ring-green-400
           transition-all duration-200 hover:border-green-400"

      >
        <option value="">Sunlight</option>
        <option value="Full Sun">Full Sun</option>
        <option value="Partial Shade">Partial Shade</option>
      </select>

      <select
        value={filters.waterFrequency}
        onChange={(e) => setFilters({ ...filters, waterFrequency: e.target.value })}
        className="w-full border rounded-xl p-2 bg-white
           focus:outline-none focus:ring-2 focus:ring-green-400
           transition-all duration-200 hover:border-green-400"

      >
        <option value="">Watering</option>
        <option value="Daily">Daily</option>
        <option value="Weekly">Weekly</option>
        <option value="Occasional">Occasional</option>
      </select>
    </div>
  );
}