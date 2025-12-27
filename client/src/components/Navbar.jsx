import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, 
  User, 
  LogOut, 
  GraduationCap, 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell,
  Info 
} from 'lucide-react';

// 👇 MATCH YOUR IP HERE (Same as Chat.jsx)
const API_URL = "http://192.168.1.6:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch Notifications on load & every 15 seconds
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); 
      return () => clearInterval(interval);
    }
  }, [user?._id]); // Added dependency for safety

  const fetchNotifications = async () => {
    try {
      // 👇 Updated to use API_URL
      const res = await axios.get(`${API_URL}/api/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching notifications");
    }
  };

  const handleRead = async (notif) => {
    try {
      // 👇 Updated to use API_URL
      await axios.put(`${API_URL}/api/notifications/${notif._id}/read`);
      
      // Update local state immediately (UI feels faster)
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      
      setShowDropdown(false);
      navigate(notif.link || "/");
    } catch (err) {
      console.log(err);
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
    window.location.reload();
  };

  // Helper for active link styling
  const isActive = (path) => location.pathname === path 
    ? "text-white bg-white/20" 
    : "text-red-100 hover:bg-red-700 hover:text-white";

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper for Notification Icons
  const getNotifIcon = (type) => {
    if (type === "event" || type === "new_event") return <Calendar size={16} className="text-purple-600" />;
    if (type === "message") return <MessageSquare size={16} className="text-blue-500" />;
    return <Info size={16} className="text-gray-500" />;
  };

  return (
    <nav className="bg-campus-red shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition">
            <GraduationCap size={28} />
            <span className="hidden md:block">CampusConnect</span>
          </Link>

          {/* CENTER LINKS */}
          <div className="flex space-x-1 md:space-x-4">
            <Link to="/" className={`p-2 rounded-lg transition ${isActive('/')}`} title="Feed">
              <Home size={24} />
            </Link>

            <Link to="/events" className={`p-2 rounded-lg transition ${isActive('/events')}`} title="Events">
              <Calendar size={24} />
            </Link>

            <Link to="/groups" className={`p-2 rounded-lg transition ${isActive('/groups')}`} title="Groups">
              <Users size={24} />
            </Link>
            
            <Link to="/chat" className={`p-2 rounded-lg transition ${isActive('/chat')}`} title="Messages">
              <MessageSquare size={24} />
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* 🔔 NOTIFICATION BELL */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-2 rounded-lg transition relative ${showDropdown ? "bg-white/20 text-white" : "text-red-100 hover:bg-red-700 hover:text-white"}`}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-white text-campus-red text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b bg-gray-50 font-bold text-gray-700 text-sm flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-xs font-normal text-gray-500">{unreadCount} unread</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-sm">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => handleRead(notif)}
                          className={`p-3 border-b hover:bg-gray-50 transition cursor-pointer flex gap-3 items-start
                            ${!notif.isRead ? 'bg-blue-50/60' : 'bg-white'}
                          `}
                        >
                          {/* Icon based on Type */}
                          <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                             {getNotifIcon(notif.type)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>

                          {/* Unread Dot */}
                          {!notif.isRead && (
                             <div className="w-2 h-2 rounded-full bg-campus-red mt-2" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE */}
            {user && (
              <Link to="/profile" className="hidden md:flex items-center gap-2 text-white hover:opacity-90 transition">
                <span className="font-medium text-sm max-w-[100px] truncate">{user.username}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/40">
                   {user.profilePicture ? (
                     <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={16} />
                   )}
                </div>
              </Link>
            )}

            {/* LOGOUT */}
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