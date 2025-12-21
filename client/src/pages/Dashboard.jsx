// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { MessageSquare, ThumbsUp, User } from 'lucide-react';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  // Fetch Posts from Backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts?new=true');
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Create Post Input */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-campus-red flex items-center justify-center text-white font-bold">
          <User size={20} />
        </div>
        <input 
          type="text" 
          placeholder="What's happening on campus?" 
          className="flex-1 bg-gray-100 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-campus-red"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button className="bg-campus-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-800">
          Post
        </button>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No posts yet. Be the first!</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                U
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Student</h4>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <p className="text-gray-800 mb-4">{post.content}</p>
            <div className="flex gap-6 text-gray-500">
              <button className="flex items-center gap-2 hover:text-campus-red"><ThumbsUp size={18}/> Like</button>
              <button className="flex items-center gap-2 hover:text-campus-red"><MessageSquare size={18}/> Comment</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;