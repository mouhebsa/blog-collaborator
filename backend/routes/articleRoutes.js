const express = require("express");
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { protect, authorize } = require("../middleware/authMiddleware");

// @route   POST /api/articles
// @desc    Create a new article
// @access  Private (Requires user to be logged in, specific role checks in controller or here)
router.post("/", protect, createArticle);

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get("/", getArticles);

// @route   GET /api/articles/:id
// @desc    Get a single article by ID
// @access  Public
router.get("/:id", getArticleById);

// @route   PUT /api/articles/:id
// @desc    Update an article
// @access  Private (Requires user to be logged in, controller handles specific logic)
router.put("/:id", protect, updateArticle);

// @route   DELETE /api/articles/:id
// @desc    Delete an article
// @access  Private/Admin
router.delete("/:id", protect, authorize(["Admin"]), deleteArticle);

module.exports = router;
