const Notification = require("../models/notification");

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("article", "title")
      .populate("comment");

    await Notification.updateMany(
      {
        user: userId,
        _id: { $in: notifications.map((n) => n._id) },
        read: false,
      },
      { $set: { read: true } }
    );

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
}

async function createNotification(data) {
  try {
    const { user, article, type, message, comment } = data;

    if (!user || !article || !type || !message) {
      throw new Error(
        "Missing required fields for notification: user, article, type, message."
      );
    }

    const newNotification = new Notification({
      user,
      article,
      type,
      message,
      comment,
      read: false,
    });

    const savedNotification = await newNotification.save();
    console.log("Notification created:", savedNotification._id);
    return savedNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

module.exports = {
  getNotifications,
  createNotification,
};
