const expressAsyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const invitationsModel = require("../models/invitationsModel");
const Itinerary = require("../models/ItinerariesModel");
const User = require("../models/userModel");
const admin = require('../utils/firebaseAdmin');
const { sendNotification } = require("./notificationsController");

const SendInvitation = expressAsyncHandler(async (req, res) => {
    try {
        const { itinerary_id, reciver } = req.body;
        const sender_id = req.user._id;

        const Reciver = await userModel.findById(reciver);
        const Sender = await userModel.findById(sender_id); // Get sender details

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

        const IsInvited = await invitationsModel.findOne({ itinerary: itinerary_id, reciver_id: reciver });

        if (IsInvited && IsInvited.status === "pending") {
            return res.status(409).json({ message: "Invite already sent" });
        }

        const itinerary = await Itinerary.findById(itinerary_id);

        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }

        // Check if the user is already in the itinerary
        if (itinerary.users.includes(reciver)) {
            return res.status(400).json({ message: "User already in the itinerary" });
        }


        const Invitation = new invitationsModel({
            itinerary: itinerary_id,
            sender_id: sender_id,
            reciver_id: reciver,
            status: "pending"
        });

        await Invitation.save();
        sendNotification(
            reciver,
            Invitation._id,
            "invite_received",
            `${Sender.username} sent you an invite to join ${itinerary.title}`,
        );

        return res.status(200).json({ message: "Invitation sent successfully", Invitation });

    } catch (error) {
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
        sendNotification(
            invite.sender_id,
            invite._id,
            "invite_accepted",
            `${user.username} accepted your invite and joined ${itinerary.title}`,
        );

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
        console.log("Rejecting invite:", inviteId, "for user:", userId);

        const user = await User.findById(userId);

        if (!User) {
            return res.status(404).json({ message: "User not found" });
        }

        const invite = await invitationsModel.findById(inviteId);
        if (!invite) {
            console.error("Invite not found:", inviteId);
            return res.status(404).json({ message: "Invitation not found" });
        }

        console.log("Invite found:", invite);

        const itinerary = await Itinerary.findById(invite.itinerary);
        if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });


        if (invite.reciver_id.toString() !== userId.toString()) {
            console.error("Unauthorized attempt to reject invite:", userId);
            return res.status(403).json({ message: "Access denied. Only the recipient can reject the invite." });
        }

        invite.status = "declined";
        await invite.save();

        sendNotification(
            invite.sender_id,
            invite._id,
            "invite_declined",
            `${user.username} declined your invite and did not join ${itinerary.title}`,
        );


        res.status(200).json({ message: "Invitation rejected successfully" });
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