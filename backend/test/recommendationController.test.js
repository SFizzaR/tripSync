const request = require("supertest");
const chai = require("chai");
const sinon = require("sinon");
const axios = require("axios");
const app = require("../app");
const UserRatings = require("../models/userRatingsModel");
const Places = require("../models/placesModel");

const { expect } = chai;
chai.should();

function recommendationsControllerTests() {
    describe("Recommendations Controller Tests", () => {
        afterEach(() => {
            sinon.restore(); // clean up after every test
        });

        describe("GET /api/recommendations/recommendations/:userId", () => {

            it("should return 400 if city is missing", async () => {
                const res = await request(app).get("/api/recommendations/recommendations/67a6bde87c4439c023793b63");
                res.status.should.equal(400);
                res.body.should.have.property("error", "City is required");
            });

            it("should return recommendations based on top categories", async () => {
                // Stub user ratings
                sinon.stub(UserRatings, "find").resolves([
                    { rating: 5, place_id: "67e757f22723d87951a384c9", user_id: "67a6bde87c4439c023793b63" }
                ]);

                // Stub Places.findOne to return a category on first call, then null (simulate new place)
                const findOneStub = sinon.stub(Places, "findOne");
                findOneStub.onFirstCall().resolves({
                    categories: ["Park"]
                });
                findOneStub.onSecondCall().resolves(null);

                // Stub Foursquare API response
                sinon.stub(axios, "get").resolves({
                    data: {
                        results: [
                            {
                                fsq_id: "newPlace123",
                                name: "Cool Park",
                                location: { address: "123 Park Lane", city: "NY" },
                                geocodes: { main: { latitude: 40.0, longitude: -74.0 } },
                                categories: [{ name: "Park" }],
                                photos: []
                            }
                        ]
                    }
                });

                // Stub save
                sinon.stub(Places.prototype, "save").resolves();

                const res = await request(app).get("/api/recommendations/recommendations/67a6bde87c4439c023793b63?city=New%20York");

                res.status.should.equal(200);
                res.body.should.be.an("array");
                res.body[0].should.have.property("name", "Cool Park");
            });
            it('should fallback to default categories if no high ratings', async () => {
                sinon.stub(UserRatings, 'find').resolves([
                    { user_id: '67a6bde87c4439c023793b63', rating: 2, place_id: '67e757f22723d87951a384cf' }
                ]);
                sinon.stub(Places, 'findOne').resolves(null);
                sinon.stub(axios, 'get').resolves({ data: { results: [] } });

                const res = await request(app).get('/api/recommendations/recommendations/67a6bde87c4439c023793b63?city=New%20York');
                res.status.should.equal(404);
                sinon.restore();
            });

        });
    });
}

module.exports = recommendationsControllerTests;
