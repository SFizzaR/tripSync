const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        invite_id: { type: mongoose.Schema.Types.ObjectId, ref: "Invitations", required: true },
        type: { type: String, enum: ["invite_received", "invite_accepted", "invite_declined"], required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema)
