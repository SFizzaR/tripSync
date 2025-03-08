const mongoose = require("mongoose")

const BlockedSchema = mongoose.Schema(
    {
        blocker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //who is blocking
        blocked_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },//who is blocked
    }
)

module.exports = mongoose.model("Blocked", BlockedSchema)