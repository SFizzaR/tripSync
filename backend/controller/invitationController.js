const expressAsyncHandler = require("express-async-handler");
const blockedModel = require("../models/blockedModel");
const userModel = require("../models/userModel");
const invitationsModel = require("../models/invitationsModel");
const Itinerary = require("../models/ItinerariesModel");
const User = require("../models/userModel")

const SendInvitation = expressAsyncHandler(async (req, res) => {
    try {
        const { itinerary_id, reciver } = req.body;
        const sender_id = req.user._id; // Fix destructuring
        const Reciver = await userModel.findById(reciver);

        if (!Reciver) {
            return res.status(404).json({ message: "User not found" });
        }

        const rejectedInvitesCount = await invitationsModel.countDocuments({
            reciver_id: reciver,
            status: "rejected"
        });

        if (rejectedInvitesCount >= 2) {
            return res.status(403).json({ message: "This user has rejected too many invites. Avoid spamming." });
        }

        const isblocked = await blockedModel.findOne({ blocker_id: Reciver._id, blocked_id: itinerary_id });

        if (isblocked) {
            return res.status(409).json({ message: "Itinerary has been blocked by this user" });
        }

        const IsInvited = await invitationsModel.findOne({ itinerary: itinerary_id, reciver_id: reciver });

        if (IsInvited && IsInvited.status === "pending") { // Fix condition
            return res.status(409).json({ message: "Invite already sent" });
        }

        const Invitation = new invitationsModel({
            itinerary: itinerary_id,
            sender_id: sender_id,
            reciver_id: reciver,
            status: "pending"
        });

        await Invitation.save();

        return res.status(200).json({ message: "Invitation sent successfully", Invitation });
    }
    catch (error) {
        console.error("Error sending invitation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const acceptInvite = expressAsyncHandler(async (req, res) => {
    try {
        const { inviteId } = req.params;
        const userId = req.user._id;

        // Find the invitation
        const invite = await invitationsModel.findById(inviteId);
        if (!invite) return res.status(404).json({ message: "Invitation not found" });

        if (invite.reciver_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. Only the recipient can accept the invite." });
        }

        // Check if itinerary exists
        const itinerary = await Itinerary.findById(invite.itinerary);
        if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure itinerary is collaborative
        if (!itinerary.collaborative) return res.status(409).json({ message: "Cannot join a solo itinerary" });

        // Check if user is already added
        if (itinerary.users.includes(userId)) {
            return res.status(400).json({ message: "User already in itinerary" });
        }

        // Add user to itinerary
        itinerary.users.push(userId);
        await itinerary.save();

        invite.status = "accepted";
        await invite.save();
        res.status(200).json({ message: "User added to itinerary", itinerary });
    } catch (error) {
        console.error("Error accepting invite:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

const rejectInvite = expressAsyncHandler(async (req, res) => {
    try {
        const { inviteId } = req.params;
        const userId = req.user._id;

        // Find the invitation
        const invite = await invitationsModel.findById(inviteId);
        if (!invite) return res.status(404).json({ message: "Invitation not found" });

        // Ensure only the receiver can reject the invite
        if (invite.reciver_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. Only the recipient can reject the invite." });
        }
        invite.status = "rejected";
    } catch (error) {
        console.error("Error rejecting invite:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

const cancelInvite = expressAsyncHandler(async (req, res) => {
    try {
        const { inviteId } = req.params;
        const userId = req.user._id;

        // Find the invitation
        const invite = await invitationsModel.findById(inviteId);
        if (!invite) return res.status(404).json({ message: "Invitation not found" });

        // Ensure only the sender can cancel the invite
        if (invite.sender_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. Only the sender can cancel the invite." });
        }
        invite.status = "canceled";

        res.status(200).json({ message: "Invitation canceled successfully." });
    } catch (error) {
        console.error("Error canceling invite:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



module.exports = { SendInvitation, acceptInvite, rejectInvite, cancelInvite }