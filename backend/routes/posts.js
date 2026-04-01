const express = require('express');
const path = require('path');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ──────────────────────────────────────────────
// GET /api/posts
// Get all posts (public feed) — sorted by newest first with pagination
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Support filter modes
    const sort = req.query.sort || 'newest';
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'mostLiked') sortOption = { likesCount: -1, createdAt: -1 };
    if (sort === 'mostCommented') sortOption = { commentsCount: -1, createdAt: -1 };

    // Aggregate to compute like/comment counts dynamically for sorting
    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNextPage: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error.message);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// ──────────────────────────────────────────────
// GET /api/posts/:id
// Get single post by ID
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// POST /api/posts
// Create a new post (auth required)
// Accepts: text (optional), image file (optional) — one must be provided
// ──────────────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = '';

    // If a file was uploaded, build the URL
    if (req.file) {
      // Local storage path served via /uploads/
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Validate at least one field
    if (!text && !imageUrl) {
      return res
        .status(400)
        .json({ message: 'Post must have either text or an image' });
    }

    const post = await Post.create({
      user: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar || '',
      text: text || '',
      image: imageUrl,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: error.message || 'Server error creating post' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/posts/:id/like
// Toggle like on a post (auth required)
// Adds/removes user ID from likes array
// ──────────────────────────────────────────────
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const isLiked = post.likes.map((id) => id.toString()).includes(userId);

    if (isLiked) {
      // Unlike: remove user from arrays
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likedByUsernames = post.likedByUsernames.filter(
        (u) => u !== req.user.username
      );
    } else {
      // Like: add user to arrays
      post.likes.push(req.user._id);
      if (!post.likedByUsernames.includes(req.user.username)) {
        post.likedByUsernames.push(req.user.username);
      }
    }

    await post.save();

    res.json({
      likes: post.likes,
      likedByUsernames: post.likedByUsernames,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error('Like error:', error.message);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// ──────────────────────────────────────────────
// POST /api/posts/:id/comment
// Add a comment to a post (auth required)
// ──────────────────────────────────────────────
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar || '',
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Return the newly added comment (last in array)
    const addedComment = post.comments[post.comments.length - 1];
    res.status(201).json(addedComment);
  } catch (error) {
    console.error('Comment error:', error.message);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/posts/:id
// Delete a post (only the post owner can delete)
// ──────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only the author can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/posts/:id/comment/:commentId
// Delete a specific comment (commenter or post owner)
// ──────────────────────────────────────────────
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = post.user.toString() === req.user._id.toString();
    const isCommenter = comment.user.toString() === req.user._id.toString();

    if (!isOwner && !isCommenter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

module.exports = router;
