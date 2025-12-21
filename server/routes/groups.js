// server/routes/groups.js
const router = require('express').Router();
const Group = require('../models/Group');

// CREATE GROUP (Feature 9)
router.post('/', async (req, res) => {
  const newGroup = new Group(req.body);
  try {
    const savedGroup = await newGroup.save();
    res.status(200).json(savedGroup);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPLOAD MATERIAL (Feature 10)
router.put('/:id/material', async (req, res) => {
  try {
    const material = {
      title: req.body.title,
      url: req.body.url, 
      uploadedBy: req.body.userId
    };
    await Group.findByIdAndUpdate(req.params.id, {
      $push: { materials: material }
    });
    res.status(200).json("Material uploaded successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// SEARCH RESOURCES (Feature 12)
router.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const results = await Group.find({ $text: { $search: query } });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;