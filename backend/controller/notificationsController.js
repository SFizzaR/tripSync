const expressAsyncHandler = require("express-async-handler");
const Notification = require("../models/notificationsModel");

const sendNotification = expressAsyncHandler(async (userId, invite_id, type, message, actions = {}) => {
    try {
        const notification = new Notification({
            user_id: userId,
            invite_id,
            type,
            message,
            actions,
        });

        await notification.save();
        console.log("Notification sent:", message);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
});

const getNotification = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ user_id: userId, read: false });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Error fetching notifications" });
    }

})

module.exports = { sendNotification, getNotification };
