import { useState, useEffect, useContext } from "react";
import {
  PlusCircle,
  Feather,
  TrendingUp,
  Search,
  Heart,
  Trash2,
  X,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../auth/AuthProvider";
import {
  getBlogs,
  createBlog,
  likeBlog,
  deleteBlog
} from "../../api/blogAPI";
import {
  getStories,
  createStory,
  likeStory,
  deleteStory
} from "../../api/storyAPI";

export default function Blog() {
  const { token, userId } = useContext(AuthContext);

  /* -------------------- STATE -------------------- */
  const [blogs, setBlogs] = useState([]);
  const [stories, setStories] = useState([]);

  const [blogText, setBlogText] = useState("");
  const [blogImagePreview, setBlogImagePreview] = useState(null);

  const [storyText, setStoryText] = useState("");
  const [storyImagePreview, setStoryImagePreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [loading, setLoading] = useState(false);

  const [blogError, setBlogError] = useState("");
  const [storyError, setStoryError] = useState("");

  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    loadBlogs();
    loadStories();
  }, []);

  const loadBlogs = async () => {
    const data = await getBlogs();
    setBlogs(Array.isArray(data) ? data : []);
  };

  const loadStories = async () => {
    const data = await getStories();
    setStories(Array.isArray(data) ? data : []);
  };

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleBlogImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* -------------------- BLOG CREATE -------------------- */
  const publishBlog = async () => {
    if (!token) return alert("Please login first");
    if (!blogText.trim()) return setBlogError("Blog cannot be empty");

    setLoading(true);
    setBlogError("");

    try {
      const blog = await createBlog(
        {
          title: blogText.split("\n")[0].slice(0, 60),
          summary: blogText.slice(0, 130),
          content: blogText,
          image: blogImagePreview
        },
        token
      );

      setBlogs(prev => [blog, ...prev]);
      setBlogText("");
      setBlogImagePreview(null);
    } catch (error) {
      console.error("Blog error:", error);
      setBlogError(error.message || "Failed to publish blog");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- STORY CREATE -------------------- */
  const publishStory = async () => {
    if (!token) return alert("Please login first");
    if (!storyText.trim()) return setStoryError("Story cannot be empty");

    setLoading(true);
    setStoryError("");

    try {
      const story = await createStory(
        { text: storyText, image: storyImagePreview },
        token
      );

      setStories(prev => [story, ...prev]);
      setStoryText("");
      setStoryImagePreview(null);
    } catch (error) {
      console.error("Story error:", error);
      setStoryError(error.message || "Failed to publish story");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- FILTER -------------------- */
  const filteredBlogs = blogs.filter(b =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedBlogs = showAllBlogs
    ? filteredBlogs
    : filteredBlogs.slice(0, 9);

  /* ==================== UI ==================== */
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      <h1 className="text-3xl font-bold text-center text-emerald-800 mb-6">
        🌿 Garden Blog & Community
      </h1>

      {/* -------------------- BLOG LIST -------------------- */}
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <TrendingUp /> Trending Blogs
          </h2>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border">
            <Search size={18} />
            <input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBlogs.map(blog => (
            <motion.div
              key={blog._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden"
            >
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold">{blog.title}</h3>
                <p className="text-gray-600">{blog.summary}</p>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>By {blog.userId?.name}</span>
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <button
                    className="flex items-center gap-1 text-pink-600 hover:text-pink-700 transition"
                    onClick={async () => {
                      if (!token) return alert("Login first");
                      const updated = await likeBlog(blog._id, token);
                      setBlogs(prev =>
                        prev.map(b =>
                          b._id === blog._id ? updated : b
                        )
                      );
                    }}
                  >
                    <Heart size={18} fill={blog.likedBy?.includes(userId) ? "currentColor" : "none"} /> {blog.likedBy?.length || 0}
                  </button>

                  <button
                    className="text-emerald-600 font-medium hover:text-emerald-700 transition"
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBlogs.length > 9 && (
          <div className="text-center">
            <button
              onClick={() => setShowAllBlogs(!showAllBlogs)}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl"
            >
              {showAllBlogs ? "Show Less" : "Load More"}
            </button>
          </div>
        )}
      </section>

      {/* -------------------- BLOG CREATE -------------------- */}
      <section className="max-w-4xl mx-auto mt-16 bg-white p-6 rounded-2xl border">
        <h2 className="text-2xl font-bold mb-4 flex gap-2 text-emerald-600">
          <PlusCircle /> Write a Blog
        </h2>

        <textarea
          className="w-full min-h-[200px] border p-4 rounded-xl"
          placeholder="Write your gardening article..."
          value={blogText}
          onChange={e => setBlogText(e.target.value)}
        />

        {blogImagePreview && (
          <div className="relative mt-4 mb-4">
            <img src={blogImagePreview} alt="Preview" className="h-48 w-full object-cover rounded-xl" />
            <button
              onClick={() => setBlogImagePreview(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mt-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition">
            <ImageIcon size={20} />
            <span>Add Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBlogImageChange}
              className="hidden"
            />
          </label>
        </div>

        {blogError && <p className="text-red-500 mt-2">{blogError}</p>}

        <button
          onClick={publishBlog}
          disabled={loading}
          className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {loading ? "Publishing..." : "Publish Blog"}
        </button>
      </section>

      {/* -------------------- STORIES -------------------- */}
      <section className="max-w-6xl mx-auto mt-20 grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-xl font-bold mb-3 flex gap-2 text-emerald-600">
            <Feather /> Share a Story
          </h2>

          <textarea
            className="w-full min-h-[120px] border p-4 rounded-xl"
            placeholder="Share your garden moment..."
            value={storyText}
            onChange={e => setStoryText(e.target.value)}
          />

          {storyImagePreview && (
            <div className="relative mt-4 mb-4">
              <img src={storyImagePreview} alt="Preview" className="h-40 w-full object-cover rounded-xl" />
              <button
                onClick={() => setStoryImagePreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="mt-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition">
              <ImageIcon size={20} />
              <span>Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleStoryImageChange}
                className="hidden"
              />
            </label>
          </div>

          {storyError && <p className="text-red-500 mt-2">{storyError}</p>}

          <button
            onClick={publishStory}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl w-full hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Publishing..." : "Publish Story"}
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {stories.length > 0 ? (
            stories.map(story => (
              <div
                key={story._id}
                className="bg-white p-5 rounded-2xl border cursor-pointer hover:shadow-md transition"
                onClick={() => setSelectedStory(story)}
              >
                {story.image && (
                  <img src={story.image} alt="Story" className="h-32 w-full object-cover rounded-lg mb-3" />
                )}
                <p className="line-clamp-3">{story.text}</p>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{story.userId?.name || story.userName}</span>
                  <span>
                    {new Date(story.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No stories yet. Be the first to share!</p>
          )}
        </div>
      </section>

      {/* -------------------- BLOG MODAL -------------------- */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              className="bg-white max-w-2xl w-full p-6 rounded-2xl overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              {selectedBlog.image && (
                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="h-64 w-full object-cover rounded-xl mb-4"
                />
              )}

              <h2 className="text-2xl font-bold mb-2">
                {selectedBlog.title}
              </h2>

              <p className="text-gray-600 mb-4">
                By {selectedBlog.userId?.name}
              </p>

              <p className="whitespace-pre-line mb-6">
                {selectedBlog.content}
              </p>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <button
                  className="text-pink-600 flex gap-1 hover:text-pink-700 transition"
                  onClick={async () => {
                    if (!token) return alert("Login first");
                    const updated = await likeBlog(
                      selectedBlog._id,
                      token
                    );
                    setBlogs(prev =>
                      prev.map(b =>
                        b._id === updated._id ? updated : b
                      )
                    );
                    setSelectedBlog(updated);
                  }}
                >
                  <Heart fill={selectedBlog.likedBy?.includes(userId) ? "currentColor" : "none"} /> {selectedBlog.likedBy?.length || 0}
                </button>

                <div className="flex gap-3">
                  {selectedBlog.userId?._id === userId && (
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={async () => {
                        await deleteBlog(selectedBlog._id, token);
                        setBlogs(prev =>
                          prev.filter(b => b._id !== selectedBlog._id)
                        );
                        setSelectedBlog(null);
                      }}
                    >
                      <Trash2 />
                    </button>
                  )}

                  <button
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
                    onClick={() => setSelectedBlog(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- STORY MODAL -------------------- */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-white max-w-2xl w-full p-6 rounded-2xl overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              {selectedStory.image && (
                <img
                  src={selectedStory.image}
                  alt="Story"
                  className="h-64 w-full object-cover rounded-xl mb-4"
                />
              )}

              <p className="text-gray-600 mb-4">
                By {selectedStory.userId?.name || selectedStory.userName}
              </p>

              <p className="whitespace-pre-line mb-6 text-lg">
                {selectedStory.text}
              </p>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <button
                  className="text-pink-600 flex gap-1 hover:text-pink-700 transition"
                  onClick={async () => {
                    if (!token) return alert("Login first");
                    const updated = await likeStory(
                      selectedStory._id,
                      token
                    );
                    setStories(prev =>
                      prev.map(s =>
                        s._id === updated._id ? updated : s
                      )
                    );
                    setSelectedStory(updated);
                  }}
                >
                  <Heart fill={selectedStory.likedBy?.includes(userId) ? "currentColor" : "none"} /> {selectedStory.likedBy?.length || 0}
                </button>

                <div className="flex gap-3">
                  {selectedStory.userId?._id === userId && (
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={async () => {
                        await deleteStory(selectedStory._id, token);
                        setStories(prev =>
                          prev.filter(s => s._id !== selectedStory._id)
                        );
                        setSelectedStory(null);
                      }}
                    >
                      <Trash2 />
                    </button>
                  )}

                  <button
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
                    onClick={() => setSelectedStory(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
