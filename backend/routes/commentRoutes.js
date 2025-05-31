const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByArticle,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/comments
// @desc    Create a new comment or reply
// @access  Private (Requires user to be logged in)
router.post("/", protect, createComment);

// @route   GET /api/comments/article/:articleId
// @desc    Get all comments for an article (nested)
// @access  Public (as per plan, can be changed to protected if needed)
router.get("/article/:articleId", protect, getCommentsByArticle);

// @route   PUT /api/comments/:commentId
// @desc    Update a comment
// @access  Private
router.put("/:commentId", protect, updateComment);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment (and its replies)
// @access  Private
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
