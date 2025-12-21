const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Feature 15: Participants
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Feature 13: Jira-style Tasks (Drag and Drop data)
  tasks: [{
    title: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['Todo', 'InProgress', 'Done'], 
      default: 'Todo' 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);