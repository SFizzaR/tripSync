const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = require("../app"); // Express app
const Places = require("../models/placesModel");
const categoryMapping = require("../controller/placesController");

// Generate mock token
const mockToken = jwt.sign({ user: { id: "67a613f156089a877ccabeac" } }, process.env.ACCESS_SECRET_TOKEN);

function placesControllerTests() {
    describe("GET /api/places/getplaces", () => {
        afterEach(() => sinon.restore());

        it("should return 400 if city is missing", async () => {
            const res = await request(app).get("/api/places/getplaces");
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "City is required");
        });

        it("should return 400 for invalid filter", async () => {
            const res = await request(app).get("/api/places/getplaces?city=New York&filter=invalidCategory");
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Invalid category filter");
        });

        it("should return places when city is provided without filter", async () => {
            sinon.stub(axios, "get").resolves({
                data: {
                    results: [
                        {
                            fsq_id: "4bf58dd8d48988d1c4941735",
                            name: "Joe's Pizza",
                            location: { city: "New York" },
                            categories: [{ id: "4bf58dd8d48988d1c4941735", name: "Restaurant" }]
                        }
                    ]
                }
            });

            const res = await request(app).get("/api/places/getplaces?city=New York");
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body[0]).to.have.property("name");
        });

        it("should return filtered places based on valid category filter", async () => {
            const filter = "restaurant";

            sinon.stub(axios, "get").resolves({
                data: {
                    results: [
                        {
                            fsq_id: "4bf58dd8d48988d1c4941735",
                            name: "Katz's Delicatessen",
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

            const res = await request(app).get(`/api/places/getplaces?city=New York&filter=${filter}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array").with.length(1);
            expect(res.body[0].name).to.equal("Katz's Delicatessen");
        });
    });

    describe("GET /api/places/place/:fsq_id", () => {
        const fsq_id = "67e757f42723d87951a384db";

        afterEach(() => sinon.restore());

        it("should return place from DB if already stored", async () => {
            const mockPlace = {
                fsq_id,
                name: "Bryant Park",
                address: "W 42nd St",
                city: "New York",
                latitude: 40.755528,
                longitude: -74.0060,
                categories: ["nature"],
                photos: [],
                reviews: []
            };

            sinon.stub(Places, "findOne").resolves(mockPlace);

            const res = await request(app).get(`/api/places/place/${fsq_id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("name", "Bryant Park");
            expect(res.body).to.have.property("fsq_id", fsq_id);
        });

        it("should fetch from Foursquare and save if not found in DB", async () => {
            sinon.stub(Places, "findOne").resolves(null);

            sinon.stub(axios, "get")
                .onCall(0).resolves({
                    data: {
                        fsq_id,
                        name: "New Foursquare Place",
                        location: {
                            locality: "New York",
                            formatted_address: "456 Avenue"
                        },
                        geocodes: {
                            main: { latitude: 40.0, longitude: -73.0 }
                        },
                        categories: [{ name: "Restaurant" }]
                    }
                })
                .onCall(1).resolves({ data: [] }) // No photos
                .onCall(2).resolves({ data: [{ text: "Great place!" }] }); // Reviews

            sinon.stub(Places.prototype, "save").resolves();

            const res = await request(app).get(`/api/places/place/${fsq_id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("name", "New Foursquare Place");
            expect(res.body.reviews).to.include("Great place!");
        });

        it("should return 404 if Foursquare returns not found", async () => {
            sinon.stub(Places, "findOne").resolves(null);

            sinon.stub(axios, "get").rejects({
                response: { status: 404, data: { message: "Not Found" } }
            });

            const res = await request(app).get("/api/places/place/invalid-id");

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Place not found in Foursquare");
        });
    });

    describe("POST /api/places/rate", () => {
        afterEach(() => sinon.restore());

        it("should fetch place from Foursquare, save if not in DB, and store rating", async () => {
            const place_id = "67e757f42723d87951a384db";

            const mockPlaceData = {
                name: "Mock Place",
                location: {
                    city: "Mock City",
                    address: "123 Mock Street"
                },
                geocodes: {
                    main: { latitude: 40.7128, longitude: -74.006 }
                },
                categories: [{ name: "Restaurant" }],
                photos: []
            };

            sinon.stub(axios, "get").resolves({ data: mockPlaceData });
            sinon.stub(Places, "findOne").resolves(null);
            sinon.stub(Places.prototype, "save").resolves();
            sinon.stub(UserRatings, "findOneAndUpdate").resolves({
                user_id: "67a6bde87c4439c023793b63",
                place_id,
                rating: 4
            });

            const res = await request(app)
                .post("/api/places/rate")
                .send({ user_id: "67a6bde87c4439c023793b63", place_id, rating: 4 });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message", "Rating saved successfully");
            expect(res.body.rating).to.include({ rating: 4 });
        });
    });

    describe("GET /api/places/ratings/:userId", () => {
        afterEach(() => sinon.restore());

        it("should return 401 if token is missing", async () => {
            const res = await request(app).get("/api/places/ratings/user123");
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("No token provided");
        });

        it("should return 403 if token user mismatches userId", async () => {
            const badToken = jwt.sign({ user: { id: "67a6bde87c4439c023793b63" } }, process.env.ACCESS_SECRET_TOKEN);

            const res = await request(app)
                .get("/api/places/ratings/67a613f156089a877ccabeac")
                .set("Authorization", `Bearer ${badToken}`);

            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Unauthorized user");
        });

        it("should return ratings for valid user", async () => {
            const mockRatings = [
                { user_id: "user123", place_id: "place1", rating: 5 },
                { user_id: "user123", place_id: "place2", rating: 3 }
            ];

            sinon.stub(UserRatings, "find").resolves(mockRatings);

            const res = await request(app)
                .get("/api/places/ratings/67a613f156089a877ccabeac")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array").with.length(2);
            expect(res.body[0]).to.have.property("rating", 5);
        });

        it("should return 404 if no ratings found", async () => {
            sinon.stub(UserRatings, "find").resolves([]);

            const res = await request(app)
                .get("/api/places/ratings/67a613f156089a877ccabeac")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal("No ratings found for this user");
        });
    });
}

module.exports = placesControllerTests;
