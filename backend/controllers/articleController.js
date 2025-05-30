const Article = require("../models/article");

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Writer, Editor, Admin)
const createArticle = async (req, res) => {
  const { title, content, image, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const article = new Article({
      title,
      content,
      image: image || "",
      tags: tags || [],
      author: req.user.id,
    });

    const createdArticle = await article.save();
    res.status(201).json(createdArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not create article" });
  }
};

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({})
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not fetch articles" });
  }
};

// @desc    Get a single article by ID
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "username email"
    );

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: "Article not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid article ID format" });
    }
    res.status(500).json({ message: "Server Error: Could not fetch article" });
  }
};

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private (Admin, Editor, or Author of the article)
const updateArticle = async (req, res) => {
  const { title, content, image, tags } = req.body;
  const articleId = req.params.id;

  try {
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const isAdmin = req.user.roles.includes("Admin");
    const isEditor = req.user.roles.includes("Editor");
    const isAuthor = article.author.toString() === req.user.id.toString();

    if (
      !(isAdmin || isEditor || (req.user.roles.includes("Writer") && isAuthor))
    ) {
      return res.status(403).json({
        message: "User not authorized to update this article",
      });
    }

    if (title) article.title = title;
    if (content) article.content = content;
    if (image !== undefined) article.image = image;
    if (tags) article.tags = tags;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid article ID format" });
    }
    res.status(500).json({ message: "Server Error: Could not update article" });
  }
};

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
const deleteArticle = async (req, res) => {
  const articleId = req.params.id;

  try {
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!req.user.roles.includes("Admin")) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete articles" });
    }

    await article.deleteOne();
    res.json({ message: "Article removed successfully" });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid article ID format" });
    }
    res.status(500).json({ message: "Server Error: Could not delete article" });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
