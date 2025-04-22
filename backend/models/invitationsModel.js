const mongoose = require("mongoose")

const inivitationSchema = mongoose.Schema(
    {
        itinerary: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary", required: true },
        sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reciver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: "pending" },
    }
)

module.exports = mongoose.model("Invitations", inivitationSchema)