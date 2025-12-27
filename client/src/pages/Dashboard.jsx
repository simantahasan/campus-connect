import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // 👈 Uses your new "Pro Tip" API utility
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // No need for ${API_URL} here, api.js handles it!
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading campus events...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Campus Events</h1>
        <Link 
          to="/create-event" 
          className="bg-campus-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-800 transition"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center">
          <p className="text-gray-500">No events found. Start by creating one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-campus-red transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-campus-red" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-campus-red" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <Link 
                    to={`/events/${event._id}`} 
                    className="flex items-center gap-2 text-campus-red font-semibold hover:underline"
                  >
                    View Details <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;