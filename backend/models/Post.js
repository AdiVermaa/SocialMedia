const mongoose = require('mongoose');

/**
 * Comment sub-document schema (embedded in Post)
 * Stores comment text, the commenter's user ID and username.
 */
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    avatar: { type: String, default: '' },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

/**
 * Post Schema
 * Stores post text, optional image URL, likes array (user IDs), and comments.
 * Either text or image must be provided.
 */
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    avatar: { type: String, default: '' },
    text: {
      type: String,
      maxlength: [2000, 'Post text cannot exceed 2000 characters'],
      default: '',
    },
    image: {
      type: String, // Cloudinary secure URL or local path
      default: '',
    },
    // Likes: array of user IDs who liked this post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Array of usernames who liked (for display without extra queries)
    likedByUsernames: [{ type: String }],
    // Embedded comments
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Validation: at least text or image must be provided
postSchema.pre('save', function () {
  if (!this.text && !this.image) {
    throw new Error('Post must have either text or an image');
  }
});
module.exports = mongoose.model('Post', postSchema);
