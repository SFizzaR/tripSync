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

const getRecivedNotification = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ user_id: userId, type: "invite_received" });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Error fetching notifications" });
    }

})
const getNotificationCount = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ user_id: userId, type: "invite_received" });
        res.status(200).json({ count: notifications.length }); // Fix: Corrected length usage
    } catch (error) {
        res.status(500).json({ error: "Error fetching notifications" });
    }
});

const updateNotification = expressAsyncHandler(async (req, res) => {
    try {
        const { notificationId, read } = req.body;

        if (!notificationId) {
            return res.status(400).json({ message: "Notification ID is required" });
        }

        if (typeof read !== "boolean") {
            return res.status(400).json({ message: "Invalid read value" });
        }

        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { $set: { read } }, // ✅ Proper update format
            { new: true } // ✅ Return updated document
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(updatedNotification);
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const deleteNotification = expressAsyncHandler(async (req, res) => {
    try {
        const { notificationId } = req.params; // ✅ Extract the correct parameter

        if (!notificationId) {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        const result = await Notification.deleteOne({ _id: notificationId }); // ✅ Use `await`

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Notification not found" }); // ✅ Handle case where notification doesn't exist
        }

        res.status(200).json({ message: "Notification deleted successfully" }); // ✅ Send success response
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Internal server error" }); // ✅ Handle server errors properly
    }
});


module.exports = { sendNotification, getNotification, updateNotification, getNotificationCount, getRecivedNotification, deleteNotification };
