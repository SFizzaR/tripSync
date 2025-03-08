const expressAsyncHandler = require("express-async-handler")
const Blocked = require("../models/blockedModel")


const createBlocked = expressAsyncHandler(async (req, res) => {
    try {
        const { itineraryId } = req.params
        const user_id = req.user._id;
        const existingBlock = await Blocked.findOne({ blocked_id: itineraryId, blocker_id: user_id });

        if (existingBlock) {
            return res.status(409).json({ message: "Itinerary is already blocked" });
        }
        const blocked = new Blocked({
            blocker_id: user_id,
            blocked_id: itineraryId
        });

        await blocked.save();
        res.status(201).json(blocked)
    }
    catch (error) {
        res.status(500).json({ message: "Error blocking itinerary", error: error.message });
    }
})

const removeBlocked = expressAsyncHandler(async (req, res) => {
    try {
        const { itineraryId } = req.params;
        const user_id = req.user._id;
        const blocked = await Blocked.findOne({ blocked_id: itineraryId, blocker_id: user_id });
        if (!blocked) return res.status(404).json({ message: "Itinerary not blocked" });
        const isBlocker = user_id.toString() === blocked.blocker_id.toString();
        if (!isBlocker) return res.status(403).json({ message: "Access denied only blocker can unblock" });

        await Blocked.findByIdAndDelete(blocked._id);
        res.status(200).json({ message: "Itinerary unblocked successfully" });
    }
    catch (error) {
        console.error("Error unblocking itinerary:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

const getBlocked = expressAsyncHandler(async (req, res) => {
    try {
        const { blocker_id } = req.user._id;
        const blocked = await Blocked.find(
            blocker_id,
        ).select("_id blocked_id").lean();
        res.status(200).json(blocked);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching blocked", error: error.message });

    }
})

module.exports = { getBlocked, removeBlocked, createBlocked }