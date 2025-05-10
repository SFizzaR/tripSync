const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const axios = require("axios");
const app = require("../app"); // Your Express app
const categoryMapping = require("../controller/placesController");

function placesControllerTests() {
    describe("GET /api/places", () => {

        afterEach(() => {
            sinon.restore();
        });

        it("should return 400 if city is missing", async () => {
            const res = await request(app).get("/api/places");
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "City is required");
        });

        it("should return 400 for invalid filter", async () => {
            const res = await request(app).get("/api/places?city=New York&filter=invalidCategory");
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Invalid category filter");
        });

        it("should return places when city is provided without filter", async () => {
            sinon.stub(axios, "get").resolves({
                data: {
                    results: [
                        {
                            fsq_id: "test123",
                            name: "Test Place",
                            location: { city: "New York" },
                            categories: [{ id: "4bf58dd8d48988d1c4941735", name: "Restaurant" }]
                        }
                    ]
                }
            });

            const res = await request(app).get("/api/places?city=New York");
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body[0]).to.have.property("name", "Test Place");
        });

        it("should return filtered places based on valid category filter", async () => {
            const filter = "restaurant"; // Make sure this exists in categoryMapping

            sinon.stub(axios, "get").resolves({
                data: {
                    results: [
                        {
                            fsq_id: "place123",
                            name: "Nice Restaurant",
                            location: { city: "New York" },
                            categories: [{ id: categoryMapping[filter][0], name: "Restaurant" }]
                        },
                        {
                            fsq_id: "place456",
                            name: "Wrong Category",
                            location: { city: "New York" },
                            categories: [{ id: "non-matching-id", name: "Park" }]
                        }
                    ]
                }
            });

            const res = await request(app).get(`/api/places?city=New York&filter=${filter}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.equal(1);
            expect(res.body[0].name).to.equal("Nice Restaurant");
        });

    });
}


module.exports = placesControllerTests
