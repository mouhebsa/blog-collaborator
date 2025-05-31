const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  type: {
    type: String,
    enum: ['new_comment', 'new_reply'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
