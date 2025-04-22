const mongoose = require("mongoose")

const itinerarySchema = mongoose.Schema(
    {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // Multiple users
        places: [
            {
                placeId: { type: String },
                placeName: { type: String }
            }
        ],
        title: { type: String, required: true, default: function () { return this.city; } }, // Will be set dynamically
        status: { type: String, enum: ["Planning", "Experiencing", "Completed"], default: "planning" },
        collaborative: { type: Boolean, default: false },
        city: { type: String, required: true },
        startDate: { type: Date, required: true }, // Required start date
        endDate: {
            type: Date,
            required: true
        },
        budget: {
            type: String,
            enum: ["Luxury", "Economical", "Standard"],
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
        }

    }
)

module.exports = mongoose.model("Itinerary", itinerarySchema);
