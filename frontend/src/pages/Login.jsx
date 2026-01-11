import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { setToken, setUserId, setUserName } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      // Login validation
      if (!form.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(form.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!form.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(form.password)) {
        newErrors.password = "Password must be at least 6 characters";
      }
    } else {
      // Signup validation
      if (!form.name.trim()) {
        newErrors.name = "Full name is required";
      } else if (form.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!form.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(form.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!form.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(form.password)) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (form.password.length > 50) {
        newErrors.password = "Password must be less than 50 characters";
      }

      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const url = isLogin
        ? `${apiUrl}/api/users/login`
        : `${apiUrl}/api/users/register`;

      const bodyData = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
          };

      console.log("Sending request to:", url);
      console.log("Body:", bodyData);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok && isLogin) {
        if (!data.token) {
          throw new Error("No token received from server");
        }
        setToken(data.token);
        setUserId(data.userId);
        setUserName(data.name);
        
        // Save user data to MongoDB
        try {
          await fetch(`${apiUrl}/api/user-data/save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`
            }
          });
        } catch (error) {
          console.error("Error saving user data:", error);
        }
        
        navigate("/");
      } else if (res.ok && !isLogin) {
        alert("Signup successful! Please login.");
        setIsLogin(true);
      } else {
        alert(data.message || data.error || `Error: ${res.status}`);
      }
    } catch (err) {
      console.error("Frontend error:", err);
      alert(`Network error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-[#139e43]">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* Login Form */}
        {isLogin && (
          <form
            id="loginForm"
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="email" className="font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#139e43] text-white py-3 rounded-xl hover:bg-[#0f7a35] transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {!isLogin && (
          <form
            id="signupForm"
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="name" className="font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#139e43] text-white py-3 rounded-xl hover:bg-[#0f7a35] transition-all disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        )}

        {/* Switch Link */}
        <div
          className="text-center mt-4 text-sm text-blue-600 cursor-pointer hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
}  