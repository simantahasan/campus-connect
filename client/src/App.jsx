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
          <Route path="/groups" element={<div className="p-4">Groups Page Coming Soon</div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path= "/messages" element={<Messages />} />
          <Route path= "/materials" element={<Materials />} />

          
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;