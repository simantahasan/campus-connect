import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 1. Imported useNavigate
import axios from "axios";
import { Plus, Users, Search, LogIn, LogOut } from "lucide-react"; 

export default function Groups() {
  const navigate = useNavigate(); // 👈 2. Initialized the hook
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/groups");
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");

    try {
      const res = await axios.post("http://localhost:5000/api/groups", {
        name: newGroupName,
        description: desc,
        createdBy: user._id,
      });
      setGroups([res.data, ...groups]);
      setNewGroupName("");
      setDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (groupId) => {
    try {
      await axios.put(`http://localhost:5000/api/groups/${groupId}/join`, {
        userId: user._id,
      });
      setGroups(groups.map((g) => {
        if (g._id === groupId) {
          if (g.members.includes(user._id)) {
            g.members = g.members.filter(id => id !== user._id);
          } else {
            g.members.push(user._id);
          }
        }
        return g;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-campus-red" size={32} /> 
          Study Groups
        </h1>
        <p className="text-gray-500 mt-2">Find your squad, ace your exams.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: CREATE & SEARCH */}
        <div className="space-y-6">
          {/* Create Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-4">Create New Group</h3>
            <div className="space-y-3">
              <input 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none transition"
                placeholder="Group Name (e.g. Java Finals)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <input 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none transition"
                placeholder="Short Description..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <button 
                onClick={handleCreate}
                className="w-full bg-campus-red text-white py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Create Group
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 p-3 border rounded-xl shadow-sm focus:outline-none focus:border-campus-red"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: GROUPS LIST */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((g) => (
            <div key={g._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between h-48">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-gray-800 truncate">{g.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    {g.members.length} Members
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{g.description || "No description provided."}</p>
              </div>

              <div className="mt-4 flex gap-2">
                {/* Join/Leave Button */}
                <button 
                  onClick={() => handleJoin(g._id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
                    ${g.members.includes(user._id) 
                      ? "bg-red-50 text-red-600 hover:bg-red-100" 
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                >
                  {g.members.includes(user._id) ? <LogOut size={16}/> : <LogIn size={16}/>}
                  {g.members.includes(user._id) ? "Leave" : "Join"}
                </button>

                {/* 👇 3. VISIT GROUP BUTTON (Working) */}
                {g.members.includes(user._id) && (
                   <button 
                     onClick={() => navigate(`/groups/${g._id}`)} 
                     className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                   >
                     Open Group
                   </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredGroups.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-400">
               No groups found. Be the first to create one!
             </div>
          )}
        </div>

      </div>
    </div>
  );
}