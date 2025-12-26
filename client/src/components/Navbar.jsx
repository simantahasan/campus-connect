import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, GraduationCap, Users } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/auth');
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path 
    ? "text-white bg-white/20" 
    : "text-red-100 hover:bg-red-700";

  return (
    <nav className="bg-campus-red shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO (Clicking goes to Home) */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition">
            <GraduationCap size={28} />
            <span className="hidden md:block">CampusConnect</span>
          </Link>

          {/* CENTER LINKS */}
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`p-2 rounded-lg transition ${isActive('/')}`}
              title="News Feed"
            >
              <Home size={24} />
            </Link>

          {/* Study Groups Link */}
          <Link
            to="/groups"
            className={`p-2 rounded=lg transition ${isActive('/groups')}`}
            title="Study Groups"
          >
              <Users size={24} />
            </Link>    
            
            <Link 
              to="/profile" 
              className={`p-2 rounded-lg transition ${isActive('/profile')}`}
              title="My Profile"
            >
              <User size={24} />
            </Link>
          </div>

          {/* RIGHT SIDE (User info & Logout) */}
          <div className="flex items-center gap-4">
            {user && (
              <Link to="/profile" className="hidden md:flex items-center gap-2 text-white hover:underline cursor-pointer">
                <span className="font-medium text-sm">{user.username}</span>
                {/* Tiny Avatar Preview */}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/50">
                   {user.profilePicture ? (
                     <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={16} />
                   )}
                </div>
              </Link>
            )}

            <button 
              onClick={handleLogout} 
              className="text-red-100 hover:text-white p-2 hover:bg-red-700 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;