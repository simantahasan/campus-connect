import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./groups.css"; // We will create this simple CSS next

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [desc, setDesc] = useState("");
  const { user } = useContext(AuthContext);

  // 1. Fetch all groups on load
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

  // 2. Create a new group
  const handleCreate = async (e) => {
    e.preventDefault();
    const newGroup = {
      name: newGroupName,
      description: desc,
      subject: "General", // Default subject
      createdBy: user._id, // The current logged-in user
    };

    try {
      const res = await axios.post("http://localhost:5000/api/groups", newGroup);
      setGroups([res.data, ...groups]); // Add new group to top of list
      setNewGroupName("");
      setDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Join or Leave a group
  const handleJoin = async (groupId, members) => {
    try {
      await axios.put(`http://localhost:5000/api/groups/${groupId}/join`, {
        userId: user._id,
      });
      
      // Refresh the list locally to show the button change
      setGroups(groups.map((g) => {
        if (g._id === groupId) {
          if (g.members.includes(user._id)) {
            // Remove user
            g.members = g.members.filter(id => id !== user._id);
          } else {
            // Add user
            g.members.push(user._id);
          }
        }
        return g;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h2>Study Groups 📚</h2>
        <p>Find your study partners or create a new squad!</p>
      </div>

      {/* CREATE GROUP FORM */}
      <div className="create-group-box">
        <input 
          type="text" 
          placeholder="Group Name (e.g. CSE110 Finals)" 
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Description (Optional)" 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleCreate}>+ Create Group</button>
      </div>

      {/* GROUPS LIST */}
      <div className="groups-grid">
        {groups.map((g) => (
          <div className="group-card" key={g._id}>
            <h3>{g.name}</h3>
            <p>{g.description}</p>
            <div className="group-meta">
              <span>👥 {g.members.length} Members</span>
            </div>
            
            <button 
              className={g.members.includes(user._id) ? "btn-leave" : "btn-join"}
              onClick={() => handleJoin(g._id, g.members)}
            >
              {g.members.includes(user._id) ? "Leave Group" : "Join Group"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}