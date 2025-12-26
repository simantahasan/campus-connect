import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, MapPin, Plus, User, Clock, CheckCircle } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // 1. Form State (Make sure all fields exist here!)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "", 
    date: "",
    time: ""
  });

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (!user) {
      alert("Please login first!");
      return;
    }
    
    if (!newEvent.title || !newEvent.location || !newEvent.date || !newEvent.time) {
      alert("Please fill in all fields: Title, Location, Date, and Time.");
      return;
    }

    // 2. Create Date Object safely
    // Input date format is usually "YYYY-MM-DD" and time is "HH:MM"
    const dateTimeString = `${newEvent.date}T${newEvent.time}`;
    const fullDate = new Date(dateTimeString);

    // 3. Check if Date is Valid
    if (isNaN(fullDate.getTime())) {
      alert("Invalid Date or Time selected. Please try again.");
      return;
    }

    try {
      // 4. Send Data
      console.log("Sending Event:", { ...newEvent, date: fullDate }); // Debug log
      
      const res = await axios.post("http://localhost:5000/api/events", {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        date: fullDate, // This is now guaranteed to be a valid Date object
        organizer: user._id
      });

      // 5. Success
      setEvents([...events, res.data]);
      setShowModal(false);
      setNewEvent({ title: "", description: "", location: "", date: "", time: "" });
      alert("Event Created Successfully!");

    } catch (err) {
      console.error("Server Error:", err.response?.data);
      alert("Failed to create event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleJoin = async (eventId) => {
    if (!user) return alert("Please login!");
    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}/join`, {
        userId: user._id
      });
      fetchEvents(); // Refresh to show updated participant count
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-campus-red" size={32} /> 
            Campus Events
          </h1>
          <p className="text-gray-500 mt-2">Workshops, study marathons, and social gatherings.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-campus-red text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      {/* EVENTS GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => {
          const isJoined = ev.participants.some(p => p === user?._id || p._id === user?._id);
          const eventDate = new Date(ev.date);
          
          return (
            <div key={ev._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                <div className="text-campus-red font-bold flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-wide">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl">{eventDate.getDate()}</span>
                </div>
                {isJoined && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                    <CheckCircle size={12}/> Going
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">{ev.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{ev.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400"/> 
                    {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400"/> 
                    {ev.location}
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleJoin(ev._id)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm border transition
                      ${isJoined 
                        ? "border-gray-300 text-gray-600 hover:bg-gray-50" 
                        : "bg-campus-red text-white border-transparent hover:bg-red-700"
                      }`}
                  >
                    {isJoined ? "Leave" : "Join"}
                  </button>
                  <button 
                    onClick={() => navigate(`/events/${ev._id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Host an Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Title Input */}
              <input 
                placeholder="Event Title" 
                className="w-full p-3 border rounded-lg"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
              
              {/* Description Input */}
              <textarea 
                placeholder="Description" 
                className="w-full p-3 border rounded-lg h-24 resize-none"
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
              
              {/* Location Input - CRITICAL FOR FIXING YOUR ERROR */}
              <input 
                placeholder="Location (e.g. Library Room 304)" 
                className="w-full p-3 border rounded-lg"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                required
              />

              {/* Date & Time */}
              <div className="flex gap-4">
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-lg"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
                <input 
                  type="time" 
                  className="w-full p-3 border rounded-lg"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-campus-red text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}