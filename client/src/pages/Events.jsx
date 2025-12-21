// client/src/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const [newTask, setNewTask] = useState("");

  // 1. Fetch Events on Load
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Create Event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/events', { ...newEvent, createdBy: "User" });
      setEvents([...events, data]);
      setNewEvent({ title: "", date: "", description: "" });
      toast.success("Event Created!");
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  // 3. Add Task to Event
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      const { data } = await api.post(`/events/${selectedEvent._id}/tasks`, {
        title: newTask,
        assignedTo: "User"
      });
      // Update local state to show new task immediately
      const updatedEvent = { ...selectedEvent, tasks: [...selectedEvent.tasks, data] };
      setEvents(events.map(ev => ev._id === selectedEvent._id ? updatedEvent : ev));
      setSelectedEvent(updatedEvent);
      setNewTask("");
      toast.success("Task Added");
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  // 4. Move Task Status (Simple Toggle for now)
  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "Todo" ? "Done" : "Todo";
    try {
      await api.put(`/events/${selectedEvent._id}/tasks/${taskId}`, { status: newStatus });
      
      // Update UI manually
      const updatedTasks = selectedEvent.tasks.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      const updatedEvent = { ...selectedEvent, tasks: updatedTasks };
      
      setEvents(events.map(ev => ev._id === selectedEvent._id ? updatedEvent : ev));
      setSelectedEvent(updatedEvent);
    } catch (err) {
      toast.error("Could not update task");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* LEFT: Event List & Create */}
      <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="text-campus-red" size={20}/> New Event
          </h3>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <input 
              className="w-full p-2 border rounded focus:border-campus-red outline-none" 
              placeholder="Event Title (e.g., Hackathon)"
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            />
            <input 
              type="date"
              className="w-full p-2 border rounded focus:border-campus-red outline-none" 
              value={newEvent.date}
              onChange={e => setNewEvent({...newEvent, date: e.target.value})}
            />
            <button className="w-full bg-campus-red text-white py-2 rounded hover:bg-red-800 transition">
              Create Event
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-3">
          {events.map(event => (
            <div 
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedEvent?._id === event._id ? 'border-campus-red bg-red-50' : 'bg-white border-gray-100 hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800">{event.title}</h4>
                <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded text-gray-600">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{event.tasks?.length || 0} Tasks</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Task Board (Kanban Style) */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        {selectedEvent ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-campus-red">{selectedEvent.title}</h2>
                <p className="text-gray-500">Manage tasks for this event</p>
              </div>
              <span className="bg-campus-red/10 text-campus-red px-3 py-1 rounded-full text-sm font-semibold">
                {selectedEvent.participants.length} Participants
              </span>
            </div>

            {/* Task Input */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input 
                className="flex-1 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-campus-red outline-none"
                placeholder="Add a new task..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
              />
              <button className="bg-gray-900 text-white px-6 rounded-lg font-medium">Add</button>
            </form>

            {/* Task Lists */}
            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
              
              {/* TODO Column */}
              <div className="bg-gray-50 p-4 rounded-xl overflow-y-auto">
                <h4 className="font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <Clock size={18}/> To Do
                </h4>
                <div className="space-y-3">
                  {selectedEvent.tasks?.filter(t => t.status === 'Todo').map(task => (
                    <div key={task._id} className="bg-white p-3 rounded shadow-sm border border-gray-100 group">
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <button 
                        onClick={() => toggleTaskStatus(task._id, 'Todo')}
                        className="text-xs text-blue-600 mt-2 hover:underline"
                      >
                        Mark as Done →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DONE Column */}
              <div className="bg-green-50/50 p-4 rounded-xl overflow-y-auto">
                <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle size={18}/> Completed
                </h4>
                <div className="space-y-3">
                  {selectedEvent.tasks?.filter(t => t.status === 'Done').map(task => (
                    <div key={task._id} className="bg-white p-3 rounded shadow-sm border border-green-100 opacity-70">
                      <p className="font-medium text-gray-500 line-through">{task.title}</p>
                      <button 
                        onClick={() => toggleTaskStatus(task._id, 'Done')}
                        className="text-xs text-gray-400 mt-2 hover:underline"
                      >
                        ← Move back
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Calendar size={64} className="mb-4 opacity-20"/>
            <p className="text-lg">Select an event to view the task board</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;