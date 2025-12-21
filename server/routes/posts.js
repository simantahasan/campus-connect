// server/routes/posts.js
const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// CREATE POST (Feature 5)
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    // TODO: Add AI Moderation Check here later (Feature 8)
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POSTS (Feature 7: Sorting)
router.get('/', async (req, res) => {
  const qNew = req.query.new;
  try {
    let posts;
    if (qNew) {
      posts = await Post.find().sort({ createdAt: -1 }); // Newest First
    } else {
      posts = await Post.find().sort({ views: -1 }); // Most Viewed/Popular
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE POST (Feature 6)
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;