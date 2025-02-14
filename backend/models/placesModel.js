const { Double } = require("bson");
const { default: mongoose } = require("mongoose");

const placesSchema = mongoose.Schema(
    {
        fsq_id: [{
            type: String,
            required: true
        }],
        name: { type: String, required: true },
        address: { type: String, required: true },
        latitude: { type: Double, required: true },
        longitude: { type: Double, required: true },
        categories: { type: [String], default: [] },
        reviews: { type: [String], default: [] },
        photos: { type: [String], default: [] },
    }
)

module.exports = mongoose.model("Places", placesSchema);