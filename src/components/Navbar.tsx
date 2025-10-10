
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if doctorId exists in localStorage
    const doctorId = localStorage.getItem("doctorId");
    setIsLoggedIn(!!doctorId);
  }, []);

  // Always show navbar on home page, otherwise hide if logged in
  const isHomePage = location.pathname === "/";
  if (isLoggedIn && !isHomePage) {
    return null;
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-[#4CAF50]">
            MindInsight
          </Link>
          <div className="flex gap-4">
            <Link to="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button variant="default" className="bg-[#4CAF50] hover:bg-[#2E7D32]">
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
