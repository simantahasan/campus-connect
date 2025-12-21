import React from 'react';

const Home = () => {
  // Dummy data for now - we will connect this to database later
  const posts = [
    { id: 1, author: "BUCC", content: "Registration for the Hackathon ends tonight! Don't miss out.", time: "2h ago" },
    { id: 2, author: "Sadia Khan", content: "Does anyone have the notes for MAT110?", time: "5h ago" },
    { id: 3, author: "Robotics Club", content: "First general body meeting is tomorrow at UB20401.", time: "1d ago" },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* "Create Post" Box */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <input 
            type="text" 
            placeholder="What's happening on campus?" 
            className="flex-1 bg-gray-100 rounded-full px-4 outline-none hover:bg-gray-50 focus:bg-white focus:ring-2 ring-campus-red transition"
          />
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-campus-red flex items-center justify-center text-white font-bold">
                {post.author[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{post.author}</h3>
                <p className="text-xs text-gray-500">{post.time}</p>
              </div>
            </div>
            <p className="text-gray-700">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;