import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, Calendar, Edit2, Check, X, CreditCard, Camera } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // 1. Load User
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
    }
  }, []);

  // 2. Handle Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Save to Backend
  const handleSave = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/update/${user._id}`, formData);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Profile Updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Update Failed");
    }
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-campus-red h-32"></div>
        <div className="px-8 pb-8">
          
          {/* --- HEADER: AVATAR & BUTTONS --- */}
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            
            {/* Profile Picture Section */}
            <div className="relative group">
              <div className="bg-white p-1 rounded-full shadow-md">
                {/* Show Image if exists, else show Icon */}
                {formData.profilePicture ? (
                  <img 
                    src={formData.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="bg-gray-200 rounded-full p-4 w-24 h-24 flex items-center justify-center">
                    <User size={48} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Edit Photo Overlay (Only in Edit Mode) */}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
                  <Camera className="text-white" size={24} />
                  {/* Hidden input hack or just use a text field below for now */}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600">
                   <X size={20} />
                </button>
                <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 flex items-center gap-2">
                   <Check size={20} /> Save
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-campus-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 flex items-center gap-2">
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* --- EDITABLE FORM SECTION --- */}
          <div className="space-y-6">
            
            {/* 1. Name & Bio */}
            <div>
               {isEditing ? (
                 <>
                   <input 
                     name="username" 
                     value={formData.username || ''} 
                     onChange={handleChange}
                     className="text-3xl font-bold text-gray-900 w-full border-b-2 border-campus-red outline-none mb-2" 
                   />
                   {/* Profile Picture URL Input */}
                   <input 
                     name="profilePicture" 
                     value={formData.profilePicture || ''} 
                     onChange={handleChange}
                     placeholder="Paste Image URL here (https://...)"
                     className="text-sm text-blue-500 w-full bg-blue-50 p-2 rounded mb-2 outline-none" 
                   />
                   <textarea 
                     name="bio" 
                     value={formData.bio || ''} 
                     onChange={handleChange}
                     placeholder="Write a short bio..."
                     className="w-full p-2 bg-gray-50 border rounded text-gray-600"
                   />
                 </>
               ) : (
                 <>
                   <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                   <p className="text-gray-600 mt-1">{user.bio || "No bio added yet."}</p>
                 </>
               )}
            </div>

            {/* 2. Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Email (Read Only) */}
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg opacity-60">
                <Mail className="text-campus-red" size={20} />
                <span>{user.email}</span>
              </div>

              {/* Major */}
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                <BookOpen className="text-campus-red" size={20} />
                {isEditing ? (
                  <input name="major" value={formData.major || ''} onChange={handleChange} placeholder="Major (e.g. CSE)" className="bg-transparent border-b border-gray-300 w-full outline-none" />
                ) : (
                  <span>{user.major || "Major not set"}</span>
                )}
              </div>

              {/* Semester (Replaces Year) */}
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                <Calendar className="text-campus-red" size={20} />
                {isEditing ? (
                  <input name="semester" value={formData.semester || ''} onChange={handleChange} placeholder="Semester (e.g. 5th)" className="bg-transparent border-b border-gray-300 w-full outline-none" />
                ) : (
                  <span>{user.semester || "Semester not set"}</span>
                )}
              </div>

              {/* Student ID (New Feature) */}
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                <CreditCard className="text-campus-red" size={20} />
                {isEditing ? (
                  <input name="studentId" value={formData.studentId || ''} onChange={handleChange} placeholder="Student ID" className="bg-transparent border-b border-gray-300 w-full outline-none" />
                ) : (
                  <span>{user.studentId || "Add Student ID"}</span>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;