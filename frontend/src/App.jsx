import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useContext } from "react";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import Guides from "./pages/Guides";
import Calendar from "./pages/Calendar";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import PlantDatabase from "./components/PlantDatabase";
import Footer from "./components/footer/Footer";
import Blog from "./pages/blogs/Blog";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResults";
import { AuthContext } from "./auth/AuthProvider";

// Protected Route Component
function ProtectedRoute({ element }) {
  const { token } = useContext(AuthContext);
  return token ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
    <BrowserRouter>
      <Header />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/guides" element={<Guides />}/>
          <Route path="/calendar" element={<Calendar />}/>
          <Route path="/gallery" element={<Gallery />}/>
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />}/>
          <Route path="/blog" element={<Blog />}/>
          <Route path="/plantdatabase" element={<PlantDatabase />}/>
          <Route path="/search" element={<SearchResults />}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
