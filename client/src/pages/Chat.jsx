import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

// Connect to the backend
const socket = io.connect("http://localhost:5000");

const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // Get user info so we know who is talking
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user ? user.username : "Anonymous";

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Send to backend
      await socket.emit("send_message", messageData);
      
      // Add to my own list locally
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    // We define the listener once
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup when leaving the page
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[80vh] flex flex-col">
        
        {/* Chat Header */}
        <div className="bg-campus-red p-4 text-white flex items-center gap-2">
          <MessageCircle size={24} />
          <h2 className="text-xl font-bold">Campus General Chat</h2>
        </div>

        {/* Messages Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messageList.map((msg, index) => {
            const isMe = msg.author === username;
            return (
              <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? "bg-campus-red text-white" : "bg-white text-gray-800 shadow-sm border"}`}>
                  <p className="font-bold text-xs mb-1 opacity-80">{msg.author}</p>
                  <p>{msg.message}</p>
                  <p className="text-[10px] text-right mt-1 opacity-70">{msg.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(event) => setCurrentMessage(event.target.value)}
            onKeyPress={(event) => event.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none focus:border-campus-red focus:ring-1 ring-campus-red"
          />
          <button 
            onClick={sendMessage}
            className="bg-campus-red text-white p-3 rounded-full hover:bg-red-700 transition"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;