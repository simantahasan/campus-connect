// server/routes/events.js
const router = require('express').Router();
const Event = require('../models/Event');

// CREATE EVENT (Feature 13)
router.post('/', async (req, res) => {
  const newEvent = new Event(req.body);
  try {
    const savedEvent = await newEvent.save();
    res.status(200).json(savedEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL EVENTS (Feature 14: Centralized Dashboard)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by upcoming date
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

// JOIN EVENT (Feature 15)
router.put('/:id/join', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event.participants.includes(req.body.userId)) {
      await event.updateOne({ $push: { participants: req.body.userId } });
      res.status(200).json("You have joined the event!");
    } else {
      res.status(400).json("You are already joined.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD TASK TO EVENT (Feature 13: Jira Task Creation)
router.post('/:id/tasks', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const newTask = {
      title: req.body.title,
      assignedTo: req.body.assignedTo, // User ID
      status: 'Todo' // Default status
    };
    await event.updateOne({ $push: { tasks: newTask } });
    res.status(200).json(newTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE TASK STATUS (Feature 13: Drag and Drop Logic)
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    // We update the specific task's status inside the array
    await Event.updateOne(
      { _id: req.params.id, "tasks._id": req.params.taskId },
      { $set: { "tasks.$.status": req.body.status } }
    );
    res.status(200).json("Task status updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;