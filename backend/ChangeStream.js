const mongoose = require("mongoose");
const invitationsModel = require("./models/invitationsModel");

const invitationStream = invitationsModel.watch();

invitationStream.on("change", async (change) => {
    try {
        const inviteId = change.documentKey._id;

        if (change.operationType === "update") {
            const updatedFields = change.updateDescription.updatedFields;

            if (updatedFields.status === "accepted") {
                console.log(`Invite ${inviteId} accepted.`);
            } else if (updatedFields.status === "canceled") {
                console.log(`Invite ${inviteId} canceled.`);
            } else if (updatedFields.status === "rejected") {
                console.log(`Invite ${inviteId} rejected. Keeping in DB.`);
            }
        }
    } catch (error) {
        console.error("Error handling change stream:", error);
    }
});
