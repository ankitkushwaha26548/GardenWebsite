import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../auth/AuthProvider'
import { Plus, X, Droplets, Sun, Sprout, Thermometer, Trash2, Leaf, Bug, Scissors, Calendar } from 'lucide-react'
import { getUserPlants, addPlant, deletePlant, fetchPlant } from '../api/api'

/* -------------------- Skeleton Loader -------------------- */
const PlantDetailsSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-40 bg-gray-200 rounded mb-8" />

    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-50 rounded-xl p-5 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
)

function Guides() {
  const { token, userId } = useContext(AuthContext)

  const [userPlants, setUserPlants] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [plantDetails, setPlantDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const careIcons = {
    watering: Droplets,
    sunlight: Sun,
    soil: Sprout,
    temperature: Thermometer,
    fertilizer: Leaf,
    pests: Bug,
    pruning: Scissors,
    seasonalTips: Calendar
  }

  useEffect(() => {
    if (!token || !userId) return

    const loadPlants = async () => {
      setIsFetching(true)
      const data = await getUserPlants(userId)
      setUserPlants(data || [])
      setIsFetching(false)
    }

    loadPlants()
  }, [token, userId])

  const handleSelectPlant = async (plant) => {
    setSelectedPlant(plant)
    setLoadingDetails(true)

    try {
      // Simulate loading delay for better UX
      await new Promise(res => setTimeout(res, 300))
      // Use the plant data directly since it already has care information
      setPlantDetails(plant)
      console.log('Plant details loaded:', plant)
    } catch (error) {
      console.error('Error loading plant details:', error)
      setPlantDetails(plant)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleAddPlant = async (e) => {
    e.preventDefault()
    if (!formName.trim()) return

    try {
      const addResponse = await addPlant({ customName: formName, actualName: formName })
      console.log('Plant added:', addResponse)
      
      // Refetch all plants after adding
      const data = await getUserPlants(userId)
      console.log('Updated plants list:', data)
      setUserPlants(data)
      setFormName('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding plant:', error)
      alert(`Failed to add plant: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plant?')) return

    setDeletingId(id)
    await deletePlant(id)
    setUserPlants(prev => prev.filter(p => p._id !== id))
    if (selectedPlant?._id === id) setSelectedPlant(null)
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-6">
      <h1 className="text-3xl font-bold text-center text-[#37604b] mb-10">
        🌿 Plant Care & Guides
      </h1>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Your Plants
            </h2>
            <button onClick={() => setShowAddForm(true)} className="text-emerald-600 hover:text-emerald-700 font-semibold">
              + Add
            </button>
          </div>

          {isFetching ? (
            <p>Loading...</p>
          ) : (
            userPlants.map(plant => (
              <div
                key={plant._id}
                onClick={() => handleSelectPlant(plant)}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between"
              >
                <span>{plant.customName}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(plant._id) }}>
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))
          )}

          {/* Add Plant Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Add New Plant
                </h3>
                <form onSubmit={handleAddPlant} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter plant name..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setFormName('')
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formName.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      Add Plant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-2">
          {!selectedPlant ? (
            <div className="bg-white p-14 rounded-2xl text-center">
              <Leaf className="w-14 h-14 mx-auto text-emerald-400 mb-4" />
              <p>Select a plant</p>
            </div>
          ) : loadingDetails ? (
            <PlantDetailsSkeleton />
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm animate-fadeUp">
              <div className="p-6 border-b bg-emerald-50 flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{plantDetails?.customName}</h2>
                  <p className="text-emerald-700">{plantDetails?.actualName}</p>
                </div>
                <button onClick={() => setSelectedPlant(null)}>
                  <X />
                </button>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-6">
                {Object.entries(plantDetails?.care || {})
                  .filter(([key, tips]) => Array.isArray(tips) && tips.length > 0)
                  .map(([key, tips]) => {
                    const Icon = careIcons[key]

                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                            {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
                          </div>
                          <h4 className="font-bold capitalize">{key === 'seasonalTips' ? 'Seasonal Tips' : key}</h4>
                        </div>

                        <ul className="space-y-2">
                          {tips.map((tip, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Guides
