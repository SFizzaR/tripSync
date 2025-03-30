const express = require("express");
const { sendNotification, getNotification, updateNotification, getNotificationCount, getRecivedNotification, deleteNotification } = require("../controller/notificationsController");
const { protect } = require("../middleware/errorHandler");
const router = express.Router();

router.post('/send', sendNotification);
router.get("/", protect, getNotification);
router.put("/", updateNotification);
router.get("/count", protect, getNotificationCount);
router.get("/recived", protect, getRecivedNotification);
router.delete('/:notificationId', deleteNotification);

module.exports = router