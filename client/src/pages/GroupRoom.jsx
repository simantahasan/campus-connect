import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { ArrowLeft, MessageSquare, FileText, Send, User, UserPlus, Upload, File, Download } from "lucide-react";

// Connect to socket
const socket = io.connect("http://localhost:5000");

export default function GroupRoom() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const scrollRef = useRef(); 
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${id}`);
        setGroup(res.data);
        if (res.data.messages) setChatHistory(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroup();

    socket.emit("join_group", id);
    socket.on("receive_group_message", (newMessage) => {
      setChatHistory((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive_group_message");
    };
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeTab]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const messageData = { groupId: id, userId: user._id, text: message };
    await socket.emit("send_group_message", messageData);
    setMessage("");
  };

  const handleAddMember = async () => {
    const usernameToAdd = prompt("Enter username to add:");
    if (!usernameToAdd) return;
    try {
      await axios.put(`http://localhost:5000/api/groups/${id}/add_member`, { username: usernameToAdd });
      alert(`Added ${usernameToAdd}!`);
      // Refresh to update count
      const res = await axios.get(`http://localhost:5000/api/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      alert(err.response?.data || "Error adding user");
    }
  };

  // 👇 NEW: Handle File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user._id);

    try {
      const res = await axios.post(`http://localhost:5000/api/groups/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Add new file to list instantly
      const updatedGroup = { ...group };
      updatedGroup.files.push(res.data);
      setGroup(updatedGroup);
      
      setSelectedFile(null); // Clear input
      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!group) return <div className="p-10 text-center">Loading Room...</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/groups" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {group.name}
              <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500">
                {group.members.length} Members
              </span>
            </h1>
            <p className="text-sm text-gray-500">{group.subject || "General Study"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleAddMember} className="p-2 text-campus-red bg-red-50 hover:bg-red-100 rounded-full transition" title="Add Member">
            <UserPlus size={20} />
          </button>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setActiveTab("chat")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'chat' ? 'bg-white shadow text-campus-red' : 'text-gray-500'}`}>
              <div className="flex items-center gap-2"><MessageSquare size={16}/> Chat</div>
            </button>
            <button onClick={() => setActiveTab("files")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'files' ? 'bg-white shadow text-campus-red' : 'text-gray-500'}`}>
              <div className="flex items-center gap-2"><FileText size={16}/> Files</div>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        
        {/* --- CHAT TAB --- */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? <div className="text-center text-gray-400 mt-10">No messages yet.</div> : 
                chatHistory.map((msg, index) => {
                  const isMe = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center overflow-hidden">
                         {msg.sender.profilePicture ? <img src={msg.sender.profilePicture} className="w-full h-full object-cover"/> : <User size={14}/>}
                      </div>}
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? "bg-campus-red text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}>
                        {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender.username}</p>}
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-red-100" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              }
              <div ref={scrollRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Type a message..." />
              <button type="submit" className="bg-campus-red text-white p-3 rounded-lg hover:bg-red-700 transition"><Send size={20} /></button>
            </form>
          </div>
        )}

        {/* --- FILES TAB (NOW FIXED) --- */}
        {activeTab === "files" && (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
            
            {/* 1. Upload Box */}
            <div className="p-6 border-b bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-700 mb-4">Share a File</h3>
              <form onSubmit={handleFileUpload} className="flex gap-4 items-center">
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-campus-red hover:file:bg-red-100"
                />
                <button 
                  type="submit" 
                  disabled={!selectedFile || isUploading}
                  className="bg-campus-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? "Uploading..." : <><Upload size={18} /> Upload</>}
                </button>
              </form>
            </div>

            {/* 2. Files List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Uploaded Files ({group.files?.length || 0})</h3>
              
              {!group.files || group.files.length === 0 ? (
                <div className="text-center text-gray-400 py-10 border-2 border-dashed rounded-lg">
                  No files shared yet. Be the first!
                </div>
              ) : (
                <div className="space-y-3">
                  {group.files.slice().reverse().map((file, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                          <File size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            Shared by {file.uploadedBy?.username || "Unknown"} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* DOWNLOAD BUTTON */}
                      <a 
                        href={`http://localhost:5000/uploads/${file.path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-campus-red transition"
                        download
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}