import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import {
  Edit2, Save, X, LogOut, Leaf,
  MapPin, Phone, Award, Shield, RefreshCw,
  Camera, Lock, Mail, Flower2, Image, Heart, Calendar,
  User, Settings, TrendingUp, BookOpen, Upload
} from 'lucide-react'
import profileAPI from '../api/profileAPI'

export default function Profile() {
  const { token, userName, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileStats, setProfileStats] = useState({
    totalPlants: 0,
    totalPosts: 0,
    totalLikes: 0,
    memberSince: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [editFormData, setEditFormData] = useState({
    bio: '',
    location: '',
    phone: '',
    gardenType: 'Outdoor',
    experience: 'Beginner'
  })

  useEffect(() => {
    if (token) {
      fetchUserProfile()
      fetchUserStats()
    }
  }, [token])

  const fetchUserStats = async () => {
    try {
      const stats = await profileAPI.getUserStats()
      setProfileStats({
        totalPlants: stats.totalPlants || 0,
        totalPosts: stats.totalPosts || 0,
        totalLikes: stats.totalLikes || 0,
        memberSince: stats.memberSince || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Set default stats on error
      setProfileStats({
        totalPlants: 0,
        totalPosts: 0,
        totalLikes: 0,
        memberSince: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
  }

  const fetchUserProfile = async () => {
    try {
      const profile = await profileAPI.getProfile()
      setProfileData(profile)
      // Set profile image if avatar exists
      if (profile.avatar) {
        setProfileImage(profile.avatar)
      }
      setEditFormData({
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        gardenType: profile.gardenType || 'Outdoor',
        experience: profile.experience || 'Beginner'
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
      // Set default profile data on error
      setProfileData({
        bio: '',
        location: '',
        phone: '',
        gardenType: 'Outdoor',
        experience: 'Beginner',
        avatar: ''
      })
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Prepare profile data with avatar if changed
      const profileUpdateData = { ...editFormData }
      
      // If profile image was changed, upload it first
      if (profileImage && profileImage.startsWith('data:image')) {
        try {
          const avatarResult = await profileAPI.uploadAvatar(profileImage)
          if (avatarResult.profile && avatarResult.profile.avatar) {
            profileUpdateData.avatar = avatarResult.profile.avatar
            setProfileImage(avatarResult.profile.avatar)
          } else if (avatarResult.avatar) {
            profileUpdateData.avatar = avatarResult.avatar
            setProfileImage(avatarResult.avatar)
          }
        } catch (avatarErr) {
          console.error('Error uploading avatar:', avatarErr)
          // Continue with profile update even if avatar upload fails
        }
      } else if (profileImage && !profileImage.startsWith('data:image')) {
        // Avatar is already a URL/base64 from backend, include it in update
        profileUpdateData.avatar = profileImage
      }
      
      const updated = await profileAPI.updateProfile(profileUpdateData)
      const updatedProfile = updated.profile || updated
      setProfileData(updatedProfile)
      
      // Update profile image if avatar is in response
      if (updatedProfile.avatar) {
        setProfileImage(updatedProfile.avatar)
      }
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      alert(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) =>
    setEditFormData(prev => ({ ...prev, [field]: value }))

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    
    try {
      setLoading(true)
      await profileAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      alert('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
    } catch (err) {
      alert(err.message || 'Failed to change password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#37604b] mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and gardening preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Profile & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg">
                      {profileImage || profileData?.avatar ? (
                        <img src={profileImage || profileData?.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userName?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <label htmlFor="profileImageInput" className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full cursor-pointer shadow-lg border border-gray-200 hover:bg-gray-50 transition">
                      <Camera size={14} className="text-emerald-600" />
                    </label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {userName}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                        <Shield size={14} />
                        {profileData?.experience || 'Beginner'} Gardener
                      </div>
                      <div className="text-sm text-gray-500">
                        Member since {profileStats.memberSince}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>

            {/* Profile Details Card */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                      <User className="text-emerald-600" size={22} />
                      Profile Information
                    </h3>
                    <p className="text-gray-500 text-sm">Update your gardening profile details</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isEditing 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        rows="3"
                        value={editFormData.bio}
                        onChange={e => handleChange('bio', e.target.value)}
                        placeholder="Tell us about your gardening journey..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          value={editFormData.location}
                          onChange={e => handleChange('location', e.target.value)}
                          placeholder="Enter your location"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          value={editFormData.phone}
                          onChange={e => handleChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Garden Type</label>
                        <select
                          value={editFormData.gardenType}
                          onChange={e => handleChange('gardenType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="Outdoor">🌳 Outdoor Garden</option>
                          <option value="Indoor">🏠 Indoor Garden</option>
                          <option value="Balcony">🏢 Balcony Garden</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                        <select
                          value={editFormData.experience}
                          onChange={e => handleChange('experience', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="Beginner">🌱 Beginner</option>
                          <option value="Intermediate">🌿 Intermediate</option>
                          <option value="Advanced">🌳 Advanced</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  profileData && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
                        <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl">
                          {profileData.bio || 'No bio added yet.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-emerald-100">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <MapPin className="text-emerald-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium text-gray-800">
                              {profileData.location || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <Phone className="text-blue-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-800">
                              {profileData.phone || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <Leaf className="text-amber-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Garden Type</p>
                            <p className="font-medium text-gray-800">
                              {profileData.gardenType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <Award className="text-purple-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Experience Level</p>
                            <p className="font-medium text-gray-800">
                              {profileData.experience}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Dashboard */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your Stats</h3>
                  <p className="text-sm text-gray-500">Garden activity overview</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Leaf className="text-emerald-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Plants</p>
                      <p className="text-sm text-gray-500">Total count</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">{profileStats.totalPlants}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Upload className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gallery Posts</p>
                      <p className="text-sm text-gray-500">Photos shared</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">{profileStats.totalPosts}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Heart className="text-pink-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Likes Received</p>
                      <p className="text-sm text-gray-500">Community likes</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-pink-700">{profileStats.totalLikes}</span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Settings className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Account</h3>
                  <p className="text-sm text-gray-500">Manage your settings</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Lock className="text-emerald-600" size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-500">Update your password</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Mail className="text-blue-600" size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Email Settings</p>
                    <p className="text-sm text-gray-500">Manage notifications</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
                  <p className="text-sm text-gray-500">Navigate quickly</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/plants')}
                  className="w-full flex items-center justify-between p-3 hover:bg-green-50 rounded-lg transition-colors text-gray-800 group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Leaf className="text-emerald-600" size={16} />
                    My Plants
                  </span>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-800 group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Image className="text-blue-600" size={16} />
                    My Gallery
                  </span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-full flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition-colors text-gray-800 group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar className="text-purple-600" size={16} />
                    Schedules
                  </span>
                  <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => navigate('/blogs')}
                  className="w-full flex items-center justify-between p-3 hover:bg-pink-50 rounded-lg transition-colors text-gray-800 group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <BookOpen className="text-pink-600" size={16} />
                    My Stories
                  </span>
                  <span className="text-pink-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Lock className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}