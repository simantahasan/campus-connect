const router = require('express').Router();
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// 1. GET ALL EVENTS (For Dashboard)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "username")
      .populate("participants", "username profilePicture")
      .populate("tasks.assignedTo", "username");
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. CREATE EVENT & NOTIFY EVERYONE
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      participants: [req.body.organizer] 
    });
    const savedEvent = await newEvent.save();

    // Notification Logic
    const allUsers = await User.find({ _id: { $ne: req.body.organizer } }, "_id");
    if (allUsers.length > 0) {
      const notifications = allUsers.map((user) => ({
        recipient: user._id,
        sender: req.body.organizer,
        type: "event", 
        message: `New Event: ${savedEvent.title}`,
        link: `/events/${savedEvent._id}`,
        isRead: false,
        createdAt: new Date()
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json(savedEvent);
  } catch (err) {
    console.log("Error creating event:", err);
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

// 6. ADD TASK & NOTIFY TEAM
router.post('/:id/tasks', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const newTask = {
      title: req.body.title,
      status: 'Todo'
    };
    
    // 1. Add the task
    await event.updateOne({ $push: { tasks: newTask } });

    // 2. NOTIFICATION: Tell everyone a new task exists
    // (Filter out the organizer or the person acting if you sent userId, 
    // but for now notifying all participants is safer)
    if (event.participants.length > 0) {
      const notifications = event.participants.map((pId) => ({
        recipient: pId,
        sender: event.organizer, // or req.body.userId if available
        type: "event_update", // Ensure this is in your Notification Model Enum
        message: `New Task: "${newTask.title}" added to ${event.title}`,
        link: `/events/${event._id}`,
        isRead: false,
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(200).json(newTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. UPDATE TASK STATUS & NOTIFY TEAM
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    // 1. Update the Task
    await Event.updateOne(
      { _id: req.params.id, "tasks._id": req.params.taskId },
      { 
        $set: { 
          "tasks.$.status": req.body.status,
          "tasks.$.assignedTo": req.body.assignedTo
        } 
      }
    );

    // 2. Fetch event to get title and participants
    const event = await Event.findById(req.params.id);
    const updatedTask = event.tasks.id(req.params.taskId);

    // 3. NOTIFICATION: Tell everyone the task moved
    // We only notify if status changed to "Done" or "InProgress" to avoid spam, 
    // or just notify on every move. Here is every move:
    if (event.participants.length > 0) {
      const notifications = event.participants.map((pId) => ({
        recipient: pId,
        sender: req.body.assignedTo || event.organizer,
        type: "event_update",
        message: `Task Update: "${updatedTask.title}" is now in ${req.body.status}`,
        link: `/events/${event._id}`,
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    res.status(200).json("Task updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 8. UPDATE EVENT & NOTIFY (e.g. Title change)
router.put("/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Notify participants
    if (updatedEvent && updatedEvent.participants) {
      const participantsToNotify = updatedEvent.participants.filter(
        (pId) => pId.toString() !== req.body.userId 
      );

      if (participantsToNotify.length > 0) {
        const notifications = participantsToNotify.map((recipientId) => ({
          recipient: recipientId,
          sender: req.body.userId || updatedEvent.organizer,
          type: "event_update", 
          message: `Update: Details for "${updatedEvent.title}" have changed.`,
          link: `/events/${updatedEvent._id}`,
          isRead: false,
        }));
        await Notification.insertMany(notifications);
      }
    }
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 9. DELETE EVENT & NOTIFY PARTICIPANTS
router.delete("/:id", async (req, res) => {
  try {
    // 1. Find the event first (so we know who to notify)
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json("Event not found");

    // 2. NOTIFICATION: Tell participants the event is cancelled
    // We filter out the organizer so they don't get a notification for their own action
    const participantsToNotify = event.participants.filter(
      (pId) => pId.toString() !== event.organizer.toString()
    );

    if (participantsToNotify.length > 0) {
      const notifications = participantsToNotify.map((pId) => ({
        recipient: pId,
        sender: event.organizer,
        type: "message", // Using 'message' type since the event link won't exist anymore!
        message: `Event Cancelled: "${event.title}" has been deleted by the organizer.`,
        link: "/events", // Redirect them to the main dashboard
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    // 3. Now actually delete it
    await event.deleteOne();
    
    res.status(200).json("Event and notifications deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------
// 🛑 IMPORTANT: THIS MUST BE THE LAST LINE
// ---------------------------------------------------
module.exports = router;