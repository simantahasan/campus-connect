import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar'; // (Make sure Layout uses this, or add it below)
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events'; 
import Profile from './pages/Profile'; 
import Chat from './pages/Chat';
import Messages from './pages/Messages';
import Materials from './pages/Materials';
import Groups from './pages/Groups';
import GroupRoom from './pages/GroupRoom';
import EventDetails from './pages/EventDetails';
import { LucideRoute } from 'lucide-react';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Auth />} />

        {/* PROTECTED ROUTES */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path= "/messages" element={<Messages />} />
          <Route path= "/materials" element={<Materials />} />
          <Route path= "/groups" element={<Groups />} />
          <Route path= "/groups/:id" element={<GroupRoom />} />
          <Route path= "/events/:id" element={<EventDetails />} />
          
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
