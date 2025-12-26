const router = require('express').Router();
const Event = require('../models/Event');

// 1. GET ALL EVENTS (For Dashboard)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET SINGLE EVENT (Critical: This was missing!)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "username")        // Show organizer name
      .populate("participants", "username profilePicture") // Show participant pics
      .populate("tasks.assignedTo", "username"); // Show who is doing tasks
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. CREATE EVENT
router.post('/', async (req, res) => {
  try {
    // We automatically add the organizer to the participants list
    const newEvent = new Event({
      ...req.body,
      participants: [req.body.organizer] 
    });
    const savedEvent = await newEvent.save();
    res.status(200).json(savedEvent);
  } catch (err) {
    console.log("Error creating event:", err); // logs error to terminal
    res.status(500).json(err);
  }
});

// 4. JOIN / LEAVE EVENT
router.put('/:id/join', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const { userId } = req.body;
    
    if (!event.participants.includes(userId)) {
      await event.updateOne({ $push: { participants: userId } });
      res.status(200).json("Joined!");
    } else {
      await event.updateOne({ $pull: { participants: userId } });
      res.status(200).json("Left!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. MANAGE PARTICIPANT (Remove user)
router.put("/:id/manage_participant", async (req, res) => {
  try {
    const { action, userId } = req.body; 
    const event = await Event.findById(req.params.id);

    if (action === "remove") {
       await event.updateOne({ $pull: { participants: userId } });
    }
    res.status(200).json("Participant updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. ADD TASK
router.post('/:id/tasks', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const newTask = {
      title: req.body.title,
      status: 'Todo'
    };
    await event.updateOne({ $push: { tasks: newTask } });
    res.status(200).json(newTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. UPDATE TASK (Drag and Drop)
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    await Event.updateOne(
      { _id: req.params.id, "tasks._id": req.params.taskId },
      { 
        $set: { 
          "tasks.$.status": req.body.status,
          "tasks.$.assignedTo": req.body.assignedTo
        } 
      }
    );
    res.status(200).json("Task updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;