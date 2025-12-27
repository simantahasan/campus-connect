import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // 👈 Added useNavigate
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Calendar, MapPin, User, CheckCircle, Plus, 
  ArrowLeft, XCircle, Trash2 
} from "lucide-react"; // 👈 Ensure Trash2 is here

// 👇 IMPORTANT: Use your Network IP
const API_URL = "http://192.168.1.6:5000";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // 👈 Initialize Navigation
  const [event, setEvent] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isOrganizer = event?.organizer?._id === user?._id;

  // 1. ADD PARTICIPANT (Organizer Only)
  const handleAddParticipant = async () => {
    const username = prompt("Enter the username to invite:");
    if (!username) return;

    try {
      // Logic to find user - for now we just show alert as per your previous code
      // If you implemented the user search route, we could do:
      const userRes = await axios.get(`${API_URL}/api/users?username=${username}`); 
      
      // If found, add them directly
      await axios.put(`${API_URL}/api/events/${id}/join`, { userId: userRes.data._id });
      alert(`User ${username} added!`);
      fetchEvent();
    } catch (err) {
      alert("User not found or error adding.");
    }
  };

  // 2. REMOVE PARTICIPANT (Organizer Only)
  const handleRemoveParticipant = async (participantId, participantName) => {
    if (!isOrganizer) return;
    if (!window.confirm(`Remove ${participantName} from this event?`)) return;

    try {
      await axios.put(`${API_URL}/api/events/${id}/manage_participant`, {
        action: "remove",
        userId: participantId
      });
      fetchEvent(); 
    } catch (err) {
      alert("Error removing user");
    }
  };

  // 👇 3. DELETE EVENT (Organizer Only) - NEW!
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;

    try {
      await axios.delete(`${API_URL}/api/events/${id}`);
      alert("Event deleted successfully!");
      navigate("/events"); // Redirect to main list
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/api/events/${id}/tasks`, { title: newTaskTitle });
      setNewTaskTitle("");
      fetchEvent();
    } catch (err) {
      alert("Error adding task");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const updatedEvent = { ...event };
    
    try {
      await axios.put(`${API_URL}/api/events/${id}/tasks/${draggableId}`, {
        status: destination.droppableId,
        assignedTo: user._id
      });
      fetchEvent();
    } catch (err) {
      console.error(err);
      fetchEvent(); 
    }
  };

  if (!event) return <div className="p-10 text-center">Loading...</div>;
  const getTasksByStatus = (status) => event.tasks?.filter(t => t.status === status) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-6 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <Link to="/events" className="flex items-center text-gray-500 hover:text-campus-red mb-4 w-fit">
            <ArrowLeft size={18} className="mr-1" /> Back to Events
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1"><Calendar size={16}/> {new Date(event.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-1"><MapPin size={16}/> {event.location}</div>
                <div className="flex items-center gap-1"><User size={16}/> Organizer: {event.organizer?.username}</div>
              </div>
            </div>
            
            {/* PARTICIPANTS SECTION */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-medium mr-2">Team:</span>
              <div className="flex -space-x-2">
                {event.participants.map((p, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleRemoveParticipant(p._id, p.username)}
                    className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer`} 
                    title={p.username}
                  >
                    {p.profilePicture ? <img src={p.profilePicture} className="w-full h-full object-cover" alt={p.username}/> : <span className="text-xs font-bold">{p.username[0]}</span>}
                    
                    {/* Hover effect for organizer to remove */}
                    {isOrganizer && p._id !== user._id && (
                      <div className="absolute inset-0 bg-red-500/80 hidden group-hover:flex items-center justify-center text-white">
                        <XCircle size={16} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Invite Button */}
                {isOrganizer && (
                  <button 
                    onClick={handleAddParticipant} 
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-campus-red hover:text-white transition" 
                    title="Invite Members"
                  >
                    <Plus size={16} />
                  </button>
                )}

                {/* 👇 NEW DELETE BUTTON (Only visible to Organizer) */}
                {isOrganizer && (
                  <button 
                    onClick={handleDelete}
                    className="ml-2 w-10 h-10 rounded-full border-2 border-white bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-x-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <form onSubmit={handleAddTask} className="mb-6 flex gap-2 max-w-lg">
            <input 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..." 
              className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 outline-none"
            />
            <button type="submit" className="bg-campus-red text-white px-4 rounded-lg hover:bg-red-700 transition">Add</button>
          </form>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
              <TaskColumn title="To Do" status="Todo" tasks={getTasksByStatus("Todo")} icon={<div className="w-3 h-3 rounded-full bg-gray-400"/>} />
              <TaskColumn title="In Progress" status="InProgress" tasks={getTasksByStatus("InProgress")} icon={<div className="w-3 h-3 rounded-full bg-blue-500"/>} />
              <TaskColumn title="Done" status="Done" tasks={getTasksByStatus("Done")} icon={<CheckCircle size={16} className="text-green-500"/>} />
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}

function TaskColumn({ title, status, tasks, icon }) {
  return (
    <div className="bg-gray-100 rounded-xl p-4 min-h-[500px] flex flex-col">
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        {icon} {title} <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
      </h3>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 transition-colors rounded-lg ${snapshot.isDraggingOver ? "bg-gray-200/50" : ""}`}>
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition ${snapshot.isDragging ? "rotate-2 shadow-xl" : ""}`}>
                    <p className="text-gray-800 font-medium text-sm">{task.title}</p>
                    {task.assignedTo && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1 rounded w-fit">
                        <User size={12}/> {task.assignedTo.username || "Assigned"}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}