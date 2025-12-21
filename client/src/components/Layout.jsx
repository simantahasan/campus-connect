import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
// 👇 1. Added 'BookOpen' to imports
import { Home, Calendar, Users, LogOut, MessageCircle, User, BookOpen } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // SAFELY GET USER DATA
  let user = null;
  try {
    const userString = localStorage.getItem("user");
    if (userString && userString !== "undefined") {
      user = JSON.parse(userString);
    }
  } catch (error) {
    localStorage.removeItem("user");
    user = null;
  }

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  // SECURITY CHECK
  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-campus-bg font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      {location.pathname !== '/login' && (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-campus-red text-white shadow-md">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex flex-col leading-tight hover:opacity-90">
              <h1 className="text-2xl font-bold tracking-wide">Campus</h1>
              <h1 className="text-xl font-bold tracking-wide -mt-1">Connect</h1>
            </Link>
          </div>

          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/20 text-white placeholder-gray-200 rounded-full py-2 px-6 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
             {/* Profile Link */}
             <Link to="/profile" className="flex items-center gap-2 hover:bg-white/20 px-3 py-1 rounded-full transition">
                <span className="font-medium hidden sm:block">
                  {user ? user.username : "Student"}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/50">
                   {user && user.profilePicture ? (
                     <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User size={16} />
                   )}
                </div>
             </Link>

             <button onClick={handleLogout} title="Logout" className="p-2 hover:bg-white/20 rounded-full transition">
               <LogOut size={20} />
             </button>
          </div>
        </header>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex max-w-7xl mx-auto mt-4 gap-6 px-4">
        
        {/* Sidebar */}
        {location.pathname !== '/login' && (
          <aside className="hidden md:block w-64 flex-shrink-0 space-y-2 sticky top-20 h-fit">
            <SidebarItem to="/" icon={<Home size={20}/>} label="Home Feed" active={location.pathname === '/'} />
            <SidebarItem to="/events" icon={<Calendar size={20}/>} label="Events & Tasks" active={location.pathname === '/events'} />
            <SidebarItem to="/groups" icon={<Users size={20}/>} label="Study Groups" active={location.pathname === '/groups'} />
            
            {/* 👇 2. ADDED STUDY MATERIALS LINK HERE 👇 */}
            <SidebarItem to="/materials" icon={<BookOpen size={20}/>} label="Study Materials" active={location.pathname === '/materials'} />

            <SidebarItem to="/messages" icon={<MessageCircle size={20}/>} label="Messages" active={location.pathname === '/messages'} />
            <SidebarItem to="/profile" icon={<User size={20}/>} label="My Profile" active={location.pathname === '/profile'} />
          </aside>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 min-h-[500px]">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${active ? 'bg-white shadow-sm font-semibold text-campus-red border-l-4 border-campus-red' : 'text-gray-700 hover:bg-white/60'}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

export default Layout;