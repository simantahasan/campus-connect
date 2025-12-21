import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from "socket.io-client";

const Messages = () => {
  const [conversations, setConversations] = useState([]); // Sidebar users
  const [currentChat, setCurrentChat] = useState(null);   // Active conversation
  const [messages, setMessages] = useState([]);           // Message list
  const [newMessage, setNewMessage] = useState("");       // Input text
  
  const scrollRef = useRef(); // For auto-scrolling
  const socket = useRef();    // To store the socket connection

  // Get logged in user info
  const user = JSON.parse(localStorage.getItem("user"));

  // ------------------------------------------
  // 🔌 1. CONNECT TO SOCKET SERVER (Run Once)
  // ------------------------------------------
  useEffect(() => {
    socket.current = io("http://localhost:5000"); // Connect to backend
    return () => {
      socket.current.disconnect(); // Cleanup on exit
    };
  }, []);

  // ------------------------------------------
  // 👂 2. LISTEN FOR INCOMING MESSAGES
  // ------------------------------------------
  useEffect(() => {
    if (!socket.current) return;

    const handleMessage = (data) => {
      // 🔒 PRIVACY CHECK:
      // Only show the message if it comes from the person I'm actively talking to.
      if (currentChat && data.sender === currentChat._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    // Subscribe to event
    socket.current.on("receive_message", handleMessage);

    // Unsubscribe when 'currentChat' changes to avoid duplicates/bugs
    return () => {
      socket.current.off("receive_message", handleMessage);
    };
  }, [currentChat]); // Re-run this listener when we switch users

  // ------------------------------------------
  // 👥 3. FETCH SIDEBAR USERS
  // ------------------------------------------
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users");
        // Filter out myself
        setConversations(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, [user._id]);

  // Helper: Generate consistent Conversation ID (e.g., "UserA_UserB")
  const getConversationId = (otherUserId) => {
    const ids = [user._id, otherUserId];
    ids.sort(); 
    return ids.join("_");
  };

  // ------------------------------------------
  // 💬 4. FETCH MESSAGES (On Click User)
  // ------------------------------------------
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const conversationId = getConversationId(currentChat._id);
        const res = await axios.get(`http://localhost:5000/api/messages/${conversationId}`);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  // ------------------------------------------
  // 📜 5. AUTO SCROLL TO BOTTOM
  // ------------------------------------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------------------------------
  // 📤 6. SEND MESSAGE HANDLER
  // ------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const conversationId = getConversationId(currentChat._id);

    // Create message object
    const messagePayload = {
      conversationId: conversationId,
      sender: user._id,
      text: newMessage,
      createdAt: Date.now() // Add local time for instant display
    };

    // A. Send to Socket (Real-time update for other user)
    socket.current.emit("send_message", messagePayload);

    try {
      // B. Save to Database
      const res = await axios.post("http://localhost:5000/api/messages", messagePayload);
      
      // Update my UI instantly
      setMessages([...messages, res.data]);
      setNewMessage(""); // Clear input
      
    } catch (err) {
      toast.error("Failed to send");
      console.log(err);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      
      {/* 🟢 SIDEBAR: User List */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b bg-gray-100 font-bold text-gray-700">
          Messaging ({conversations.length})
        </div>
        {conversations.map((c) => (
          <div
            key={c._id}
            onClick={() => setCurrentChat(c)}
            className={`flex items-center p-4 cursor-pointer hover:bg-red-50 transition 
              ${currentChat?._id === c._id ? "bg-red-100 border-l-4 border-campus-red" : ""}`}
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <span className="block font-semibold text-gray-800">{c.username}</span>
              <span className="text-xs text-gray-500">{c.major || "Student"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔵 CHAT AREA */}
      <div className="w-2/3 flex flex-col">
        {currentChat ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center justify-between">
              <span className="font-bold text-lg text-gray-800">
                Chat with <span className="text-campus-red">{currentChat.username}</span>
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  <p>No messages yet.</p>
                  <p className="text-sm">Say hello! 👋</p>
                </div>
              )}
              
              {messages.map((m, index) => {
                const isMe = m.sender === user._id;
                return (
                  <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow-sm text-sm 
                        ${isMe 
                          ? "bg-campus-red text-white rounded-br-none" 
                          : "bg-white text-gray-800 border rounded-bl-none"}`}
                    >
                      <p>{m.text}</p>
                      {/* TIMESTAMP */}
                      <span className={`text-[10px] block text-right mt-1 ${isMe ? "text-red-100" : "text-gray-400"}`}>
                        {m.createdAt 
                          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {/* Invisible div to scroll to */}
              <div ref={scrollRef} /> 
            </div>

            {/* Input Box */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex gap-2">
              <input
                className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-campus-red bg-gray-100"
                placeholder="Type a message..."
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-campus-red text-white p-3 rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          // Empty State (No chat selected)
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <User size={64} className="mb-4 opacity-20" />
            <span className="text-xl">Select a student to start chatting</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;