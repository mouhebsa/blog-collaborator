const express = require("express");
const router = express.Router();
const { getNotifications } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);

module.exports = router;
