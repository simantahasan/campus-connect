import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get current user from storage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching notifications");
    }
  };

  const handleRead = async (notif) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notif._id}/read`);
      setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setShowDropdown(false);
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="relative mr-4">
      {/* BELL ICON BUTTON */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-red-100 hover:text-white p-2 rounded-full hover:bg-red-800 transition relative"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-white text-campus-red text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-red-600">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left">
          <div className="p-3 border-b bg-gray-50 font-bold text-gray-700 text-sm flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && <span className="text-xs text-blue-600 font-normal">{unreadCount} new</span>}
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
                    ${!notif.isRead ? 'bg-red-50' : 'bg-white'}
                  `}
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-campus-red' : 'bg-gray-200'}`} />
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}