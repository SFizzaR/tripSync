const mongoose = require("mongoose")

const itinerarySchema = mongoose.Schema(
    {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}], // Multiple users
        places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true }], // At least one required
        title: { type: String, required: true }, // Will be set dynamically
        status: { type: String, enum: ["planning", "in-progress", "complete"], default: "planning" },
        collaborative: { type: Boolean, default: false }
        
    }
)

itinerarySchema.pre("save", async function (next) {
    if (this.places.length > 0) {
      const firstPlace = await Place.findById(this.places[0]);
      if (firstPlace) {
        this.title = firstPlace.city; // Set title as the city of the first place
      }
    }
    next();
  });

module.exports = mongoose.model("Itinerary", itinerarySchema);
