const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please add comment text"],
    trim: true,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  article: {
    type: mongoose.Schema.ObjectId,
    ref: "Article",
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: "Comment",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

commentSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
