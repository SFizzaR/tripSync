const mongoose = require("mongoose")

const itinerarySchema = mongoose.Schema(
    {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}], // Multiple users
        places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }], // At least one required
        title: { type: String, required: true,  default: function () { return this.city; }}, // Will be set dynamically
        status: { type: String, enum: ["planning", "in-progress", "complete"], default: "planning" },
        collaborative: { type: Boolean, default: false },
        city: {type: String, required: true},
        startDate: { type: Date }, // Required start date
    endDate: { 
        type: Date, 
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
