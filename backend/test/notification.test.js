const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const app = require("../app"); // Express app
const Notification = require("../models/notificationsModel");

const mockToken = jwt.sign({ user: { id: "67a613f156089a877ccabeac" } }, process.env.ACCESS_SECRET_TOKEN);

function notificationControllerTests() {
    describe("PUT /api/notifications/", () => {
        let notificationId;

        afterEach(() => sinon.restore());

        beforeEach(async () => {
            const notif = await Notification.create({
                user_id: "67a613f156089a877ccabeac",
                message: "Mark me read",
                type: "invite_received",
                invite_id: "680dcbc7e5e21f41f8967008",
                actions: {},
                read: false,
            });
            notificationId = notif._id;
        });

        it("should mark notification as read", async () => {
            const res = await request(app)
                .post("/api/notifications/update")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ notificationId, read: true });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("read", true);
        });

        it("should return 400 Notification ID required", async () => {
            const res = await request(app)
                .post("/api/notifications/update")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ read: true });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Notification ID is required");
        });

        it("should return 400 Invalid read value", async () => {
            const res = await request(app)
                .post("/api/notifications/update")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ notificationId, read: "not bool" });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Invalid read value");
        });
    });

    describe("DELETE /api/notifications/:notificationId", () => {
        let notificationId;

        afterEach(() => sinon.restore());

        beforeEach(async () => {
            const notif = await Notification.create({
                user_id: "67a613f156089a877ccabeac",
                message: "Delete me",
                type: "invite_received",
                invite_id: "680dcbc7e5e21f41f8967008",
                actions: {},
                read: false,
            });
            notificationId = notif._id;
        });

        it("should delete a notification", async () => {
            const res = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("message", "Notification deleted successfully");
        });

        it("should return 400 Notification ID is required", async () => {
            const res = await request(app)
                .delete(`/api/notifications/`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Notification ID is required");
        });

        it("should return 404 Notification not found", async () => {
            const res = await request(app)
                .delete(`/api/notifications/2i4545488028424`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Notification not found");
        });
    });
}

module.exports = notificationControllerTests;
