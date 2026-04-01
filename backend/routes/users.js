const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ──────────────────────────────────────────────
// GET /api/users/:username
// Get a public user profile by username
// ──────────────────────────────────────────────
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also return their posts
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/users/profile/update
// Update the authenticated user's profile (bio and/or avatar)
// ──────────────────────────────────────────────
router.put('/profile/update', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { bio } = req.body;
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;

    // If an avatar file was uploaded, build the URL
    if (req.file) {
      updateData.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Sync avatar change to all user's posts if it was updated
    if (updateData.avatar) {
      await Post.updateMany(
        { user: req.user._id },
        { $set: { avatar: updateData.avatar } }
      );
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/users/:id/follow
// Follow or unfollow a user (toggle)
// ──────────────────────────────────────────────
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following
      .map((id) => id.toString())
      .includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error('Follow error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
