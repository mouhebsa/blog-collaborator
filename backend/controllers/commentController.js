const Comment = require("../models/comment");
const Article = require("../models/article");

// @desc    Create a new comment or reply
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { text, articleId, parentCommentId } = req.body;
    const author = req.user.id;

    if (!text || !articleId) {
      return res
        .status(400)
        .json({ message: "Text and articleId are required" });
    }

    const articleExists = await Article.findById(articleId);
    if (!articleExists) {
      return res.status(404).json({ message: "Article not found" });
    }

    const commentData = {
      text,
      author,
      article: articleId,
    };

    if (parentCommentId) {
      const parentExists = await Comment.findById(parentCommentId);
      if (!parentExists) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentExists.article.toString() !== articleId) {
        return res
          .status(400)
          .json({
            message: "Parent comment does not belong to the specified article",
          });
      }
      commentData.parentComment = parentCommentId;
    }

    let newComment = await Comment.create(commentData);
    newComment = await newComment.populate("author", "username email"); // Populate author details

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(500)
      .json({
        message: "Server error while creating comment",
        error: error.message,
      });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Text is required for updating a comment" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this comment" });
    }

    comment.text = text;
    comment.updatedAt = Date.now();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "username email"
    );
    res.status(200).json(populatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res
      .status(500)
      .json({
        message: "Server error while updating comment",
        error: error.message,
      });
  }
};

// @desc    Delete a comment (and its replies)
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this comment" });
    }

    const deleteRepliesRecursive = async (parentId) => {
      const replies = await Comment.find({ parentComment: parentId });
      for (const reply of replies) {
        await deleteRepliesRecursive(reply._id); // Recursively delete children of this reply
        await Comment.findByIdAndDelete(reply._id);
      }
    };

    await deleteRepliesRecursive(commentId);

    await Comment.findByIdAndDelete(commentId);

    res
      .status(200)
      .json({ message: "Comment and its replies deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({
        message: "Server error while deleting comment",
        error: error.message,
      });
  }
};

// @desc    Get all comments for an article (nested)
// @route   GET /api/comments/article/:articleId
// @access  Public
const getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const articleExists = await Article.findById(articleId);
    if (!articleExists) {
      return res.status(404).json({ message: "Article not found" });
    }

    const comments = await Comment.find({ article: articleId })
      .populate("author", "username email")
      .sort({ createdAt: "asc" });

    const buildCommentTree = (list) => {
      const map = {};
      const roots = [];
      list.forEach((comment) => {
        map[comment._id.toString()] = { ...comment.toObject(), replies: [] };
      });

      list.forEach((comment) => {
        if (comment.parentComment) {
          const parentIdString = comment.parentComment.toString();
          if (map[parentIdString]) {
            map[parentIdString].replies.push(map[comment._id.toString()]);
          } else {
            roots.push(map[comment._id.toString()]);
          }
        } else {
          roots.push(map[comment._id.toString()]);
        }
      });
      return roots;
    };

    const nestedComments = buildCommentTree(comments);
    res.status(200).json(nestedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({
        message: "Server error while fetching comments",
        error: error.message,
      });
  }
};

module.exports = {
  createComment,
  getCommentsByArticle,
  updateComment,
  deleteComment,
};
