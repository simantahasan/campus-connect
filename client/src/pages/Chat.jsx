import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, MessageCircle, User, Search } from 'lucide-react';
import { useLocation } from "react-router-dom";

const socket = io.connect("http://localhost:5000");

const Chat = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]); 
  const [currentChat, setCurrentChat] = useState(null);   
  const [messages, setMessages] = useState([]);           
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Get current user info
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. FETCH ALL SIDEBAR USERS
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${user._id}/all`);
        setConversations(res.data);
      } catch (err) {
        console.log("Error fetching sidebar users", err);
      }
    };
    if (user) getUsers();
  }, [user._id]);

  // 2. AUTO-OPEN CHAT FROM URL (THE FIX)
  useEffect(() => {
    const autoOpen = async () => {
      const params = new URLSearchParams(location.search);
      const conversationId = params.get("conversationId");

      if (conversationId && user) {
        // Extract the friend's ID from "UserA_UserB"
        const members = conversationId.split("_");
        const friendId = members.find((m) => m !== user._id);

        if (friendId) {
          // STRATEGY A: Check if they are already in the loaded sidebar list
          const foundInList = conversations.find((c) => c._id === friendId);
          
          if (foundInList) {
            setCurrentChat(foundInList);
          } else {
            // STRATEGY B (Fallback): Sidebar might be empty or loading. Fetch this specific user directly.
            try {
              const res = await axios.get(`http://localhost:5000/api/users/${friendId}`);
              setCurrentChat(res.data);
            } catch (err) {
              console.error("Could not fetch user directly", err);
            }
          }
        }
      }
    };
    autoOpen();
  }, [location.search, conversations, user]);


  // 3. FETCH MESSAGES WHEN CHAT SWITCHES
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      
      const id1 = user._id;
      const id2 = currentChat._id;
      // Ensure consistent ID generation (Alphabetical)
      const conversationId = id1 > id2 ? `${id1}_${id2}` : `${id2}_${id1}`;

      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${conversationId}`);
        setMessages(res.data);
        socket.emit("join_room", conversationId);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat, user._id]);

  // 4. LISTEN FOR INCOMING MESSAGES
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (currentChat && (data.sender === currentChat._id || data.sender === user._id)) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => socket.off("receive_message");
  }, [currentChat, user._id]);

  // 5. SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const id1 = user._id;
    const id2 = currentChat._id;
    const conversationId = id1 > id2 ? `${id1}_${id2}` : `${id2}_${id1}`;

    const messageData = {
      conversationId: conversationId,
      sender: user._id,
      text: newMessage,
    };

    // Optimistic Update
    const tempMsg = { ...messageData, createdAt: Date.now() };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    // Send to Socket
    socket.emit("send_message", tempMsg);

    // Save to DB
    try {
      await axios.post("http://localhost:5000/api/messages", messageData);
    } catch (err) {
      console.log(err);
    }
  };

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-100 p-4 flex gap-4">
      
      {/* SIDEBAR */}
      <div className="hidden md:flex w-1/3 bg-white rounded-xl shadow-md overflow-hidden flex-col">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MessageCircle size={20}/> Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div 
              key={c._id}
              onClick={() => setCurrentChat(c)}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-red-50 transition border-b border-gray-50
                ${currentChat?._id === c._id ? "bg-red-50 border-l-4 border-l-campus-red" : ""}
              `}
            >
               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {c.profilePicture ? <img src={c.profilePicture} alt="" className="w-full h-full object-cover"/> : <User className="p-2 w-full h-full text-gray-500"/>}
               </div>
               <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{c.username}</h3>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col overflow-hidden relative">
        {currentChat ? (
          <>
            <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {currentChat.profilePicture ? <img src={currentChat.profilePicture} alt="" className="w-full h-full object-cover"/> : <User className="p-2 w-full h-full text-gray-500"/>}
              </div>
              <div>
                 <h3 className="font-bold text-gray-800">{currentChat.username}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m, index) => (
                <div key={index} ref={scrollRef} className={`flex ${m.sender === user._id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                    ${m.sender === user._id 
                      ? "bg-campus-red text-white rounded-br-none" 
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                    <div className={`text-[10px] mt-1 text-right ${m.sender === user._id ? "text-red-100" : "text-gray-400"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
              <input 
                className="flex-1 bg-gray-100 border-0 rounded-full px-5 py-3 focus:ring-2 focus:ring-campus-red focus:bg-white transition outline-none"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-campus-red hover:bg-red-700 text-white p-3 rounded-full transition shadow-md flex items-center justify-center w-12 h-12">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={64} className="mb-4 text-gray-200" />
            <p className="text-lg font-medium">Select a student to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;