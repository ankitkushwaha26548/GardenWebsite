import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Heart, X, Calendar, User, ChevronLeft, ChevronRight, Image as ImageIcon, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import galleryAPI from "../api/galleryAPI.js";
import { AuthContext } from "../auth/AuthProvider";

export default function GalleryPage() {
  const { token, userId: authUserId, userName: authUserName } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [liking, setLiking] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const userId = authUserId || localStorage.getItem("userId");
  const userName = authUserName || localStorage.getItem("userName") || "Anonymous";
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const isLoggedIn = !!token || !!userId;

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const data = await galleryAPI.getAllPosts(pageNum);
      if (append) {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      } else {
        setPosts(data.posts || []);
      }
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || pageNum);
    } catch (err) {
      setError("Failed to load gallery posts. Please try again.");
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (page < totalPages) {
      fetchPosts(page + 1, true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !userId) {
      setError("Please log in to upload photos");
      setShowModal(false);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    if (!image) {
      setError("Please select an image");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    try {
      const postData = {
        userId,
        userName,
        userEmail,
        title: title.trim(),
        description: description.trim(),
        imageUrl: image,
      };

      const newPost = await galleryAPI.addPost(postData);
      setPosts([newPost, ...posts]);

      setTitle("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setShowModal(false);
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add post");
    }
  };

  const handleLike = async (postId) => {
    if (liking === postId) return;
    
    if (!isLoggedIn || !userId) {
      setError("Please log in to like posts");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    
    try {
      setLiking(postId);
      const updatedPost = await galleryAPI.toggleLike(postId, userId);
      setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch (err) {
      setError(err.message || "Failed to like post");
    } finally {
      setLiking(null);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isLoggedIn || !userId) {
      setError("Please log in to delete posts");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await galleryAPI.deletePost(postId, userId);
      setPosts(posts.filter((p) => p._id !== postId));
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(null);
      }
      setSuccess("Post deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete post");
    }
  };

  const isLiked = (post) => post.likes?.some((like) => like === userId);

  const navigatePosts = (direction) => {
    if (!selectedPost) return;
    const currentIdx = posts.findIndex(p => p._id === selectedPost._id);
    let newIdx;
    if (direction === 'next') {
      newIdx = currentIdx === posts.length - 1 ? 0 : currentIdx + 1;
    } else {
      newIdx = currentIdx === 0 ? posts.length - 1 : currentIdx - 1;
    }
    setSelectedPost(posts[newIdx]);
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#37604b] mb-3 sm:mb-4">
          🌿 Garden Gallery
        </h1>
        {!isLoggedIn && (
          <p className="text-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 px-2">
            Browse gallery posts. <span className="text-green-600 font-medium">Log in</span> to upload, like, and interact with posts.
          </p>
        )}

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-red-700 text-xs sm:text-sm max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-green-700 text-xs sm:text-sm max-w-2xl mx-auto"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Photo Button */}
        <div className="flex justify-center mb-6 sm:mb-8">
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Upload Garden Photo
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setError("Please log in to upload photos");
                setTimeout(() => navigate("/login"), 1500);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
            >
              <LogIn size={18} className="sm:w-5 sm:h-5" />
              Log in to Upload Photo
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="w-14 sm:w-16 h-14 sm:h-16 border-4 border-green-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-14 sm:w-16 h-14 sm:h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium text-sm">Loading garden posts...</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && posts.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Like Button */}
                    {isLoggedIn ? (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post._id);
                        }}
                        disabled={liking === post._id}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${
                          isLiked(post)
                            ? 'bg-red-500/90 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                        } transition-all duration-200 ${liking === post._id ? 'opacity-50' : ''}`}
                      >
                        <Heart
                          size={18}
                          fill={isLiked(post) ? "currentColor" : "none"}
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setError("Please log in to like posts");
                          setTimeout(() => navigate("/login"), 1500);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm bg-white/90 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                        title="Log in to like"
                      >
                        <Heart size={18} />
                      </motion.button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {post.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{post.userName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={10} />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                      {post.title}
                    </h3>

                    {/* Description */}
                    {post.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.description}
                      </p>
                    )}

                    {/* Likes Counter */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Heart size={16} className={isLiked(post) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                        <span className="text-sm font-medium">{post.likeCount || 0} likes</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium px-3 py-1 bg-green-50 rounded-full">
                        View Details
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Load More Button */}
          {page < totalPages && (
            <div className="flex justify-center mt-12 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMore}
                disabled={loading}
                className="bg-white border-2 border-green-600 text-green-600 px-10 py-3 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 font-bold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More Photos"}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-6">
            <ImageIcon size={64} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No photos yet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Be the first to share your beautiful garden with the community!
          </p>
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Upload Your First Photo
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setError("Please log in to upload photos");
                setTimeout(() => navigate("/login"), 1500);
              }}
              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <LogIn size={20} />
              Log in to Upload Photo
            </motion.button>
          )}
        </div>
      )}

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Blurred Background */}
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(12px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setSelectedPost(null)}
            />

            {/* Modal Content */}
            <div className="relative h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <X size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
                </button>

                {/* Navigation Arrows */}
                {posts.length > 1 && (
                  <>
                    <button
                      onClick={() => navigatePosts('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <ChevronLeft size={24} className="text-gray-700 group-hover:text-green-600" />
                    </button>
                    <button
                      onClick={() => navigatePosts('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <ChevronRight size={24} className="text-gray-700 group-hover:text-green-600" />
                    </button>
                  </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 h-[85vh]">
                  {/* Image Section */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
                    <div className="relative max-h-full max-w-full">
                      <motion.img
                        key={selectedPost._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        src={selectedPost.imageUrl}
                        alt={selectedPost.title}
                        className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col p-8 lg:p-10 overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {selectedPost.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{selectedPost.userName}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar size={12} />
                          <span>
                            {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {selectedPost.title}
                    </h2>

                    {/* Description */}
                    {selectedPost.description && (
                      <div className="mb-8">
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {selectedPost.description}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-200">
                      {isLoggedIn ? (
                        <button
                          onClick={() => handleLike(selectedPost._id)}
                          disabled={liking === selectedPost._id}
                          className={`flex items-center gap-2 transition-all duration-200 ${
                            isLiked(selectedPost)
                              ? 'text-red-600'
                              : 'text-gray-600 hover:text-red-600'
                          } ${liking === selectedPost._id ? 'opacity-50' : ''}`}
                        >
                          <Heart
                            size={24}
                            fill={isLiked(selectedPost) ? "currentColor" : "none"}
                            className={isLiked(selectedPost) ? "animate-pulse" : ""}
                          />
                          <span className="font-bold text-xl">{selectedPost.likeCount || 0}</span>
                          <span className="text-gray-500">Likes</span>
                        </button>
                      ) : (
                        <div 
                          onClick={() => {
                            setError("Please log in to like posts");
                            setTimeout(() => navigate("/login"), 1500);
                          }}
                          className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-200"
                        >
                          <Heart size={24} />
                          <span className="font-bold text-xl">{selectedPost.likeCount || 0}</span>
                          <span className="text-gray-500">Likes</span>
                          <span className="text-xs text-gray-400 ml-2">(Log in to like)</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button (only for post owner) */}
                    {selectedPost.userId === userId && (
                      <div className="mt-auto pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                              handleDeletePost(selectedPost._id);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Trash2 size={18} />
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowModal(false);
              setImagePreview(null);
              setTitle("");
              setDescription("");
              setImage(null);
              setError("");
            }}
          />
          
          <div className="relative h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload Garden Photo</h2>
                    <p className="text-green-100 mt-1">Share your beautiful garden with the community</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setImagePreview(null);
                      setTitle("");
                      setDescription("");
                      setImage(null);
                      setError("");
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAddPost} className="p-6">
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Garden Photo
                    </label>
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl shadow-lg"
                          />
                          <label htmlFor="fileInput" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center cursor-pointer">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                                <ImageIcon size={20} className="text-green-600" />
                              </div>
                              <span className="text-white font-medium">Change Image</span>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <label htmlFor="fileInput" className="block">
                          <div className="border-3 border-dashed border-green-200 hover:border-green-400 rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Plus size={24} className="text-white" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                              Click to upload garden photo
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., My Beautiful Rose Garden in Spring"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Tell us about your garden, plants, or gardening tips..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setImagePreview(null);
                        setTitle("");
                        setDescription("");
                        setImage(null);
                        setError("");
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Upload to Gallery
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
