const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");

function userControllerTests() {
    describe("User Controller Tests", () => {
        describe("POST /api/users/register", () => {
            it("should register a new user successfully", async () => {
                const newUser = {
                    first_name: "Test",
                    last_name: "case",
                    username: "valid_test",
                    email: "test@example.com",
                    age: 30,
                    city: "New York",
                    password: "password123",
                };

                const res = await request(app).post("/api/users/register").send(newUser);

                expect(res.status).to.equal(201);
                expect(res.body).to.have.property("email", "test@example.com");
                expect(res.body).to.have.property("username", "valid_test");
            });

            it("should return an error if required fields are missing", async () => {
                const incompleteUser = {
                    first_name: "Incomplete",
                    last_name: "Test",
                    email: "incomplete@example.com",
                    password: "password123",
                };

                const res = await request(app).post("/api/users/register").send(incompleteUser);

                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("message", "All fields are mandatory");
            });

            it("should return an error if user already exists", async () => {
                const existingUser = {
                    first_name: "Test",
                    last_name: "case",
                    username: "valid_test",
                    email: "test@example.com",
                    age: 30,
                    city: "New York",
                    password: "password123",
                };

                await request(app).post("/api/users/register").send(existingUser); // first time

                const res = await request(app).post("/api/users/register").send(existingUser); // second time

                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("message", "User already registered");
            });
        });

        describe("POST /api/users/login", () => {
            it("should log in a user successfully with correct credentials (email)", async () => {
                const loginUser = {
                    email: "test@example.com",
                    password: "password123",
                };

                const res = await request(app).post("/api/users/login").send(loginUser);

                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("accessToken");
                expect(res.body).to.have.property("email", "test@example.com");
            });

            it("should login a user successfully with correct credentials (username)", async () => {

                const loginUser = {
                    username: "valid_test",
                    password: "password123",
                };

                const res = await request(app).post("/api/users/login").send(loginUser);

                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("accessToken");
                expect(res.body).to.have.property("username", "valid_test");
            })

            it("should return an error with Invalid credentials", async () => {
                const wrongCredentials = {
                    email: "wrong@example.com",
                    password: "wrongpassword",
                };

                const res = await request(app).post("/api/users/login").send(wrongCredentials);

                expect(res.status).to.equal(401);
                expect(res.body).to.have.property("message", "Invalid credentials");
            });

        });

        describe("GET /api/users/getname", () => {
            let token;

            before(async () => {
                // Log in first to get a token
                const loginRes = await request(app)
                    .post("/api/users/login")
                    .send({
                        email: "test@example.com",
                        password: "password123",
                    });

                token = loginRes.body.accessToken;
            });

            it("should return user's first name and other details with valid token", async () => {
                const res = await request(app)
                    .get("/api/users/getname")
                    .set("Authorization", `Bearer ${token}`); // Set the token in headers

                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("first_name");
                expect(res.body).to.have.property("username");
                expect(res.body).to.have.property("email", "test@example.com");
                expect(res.body).to.have.property("city");
            });

            it("should fail with 401 if no token is provided", async () => {
                const res = await request(app).get("/api/users/getname");

                expect(res.status).to.equal(401); // Unauthorized
                expect(res.body).to.have.property("message");
            });
        });

        describe("GET /api/users/getusers", () => {

            it("should return users matching the search query", async () => {
                const res = await request(app)
                    .get("/api/users/getusers")
                    .send({ name: "test" });

                expect(res.status).to.equal(200);
                expect(res.body).to.be.an("array");
                expect(res.body[0]).to.have.property("username");
            });

            it("should return 400 if name is missing", async () => {
                const res = await request(app)
                    .get("/api/users/getusers")
                    .send({});

                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("message", "Search query is required");
            });

            it("should return 404 if no users are found", async () => {
                const res = await request(app)
                    .get("/api/users/getusers")
                    .send({ name: "nonexistentuser123" });

                expect(res.status).to.equal(404);
                expect(res.body).to.have.property("message", "No users found");
            });
        });
        describe("GET /api/users/all", () => {
            let token, userId;

            before(async () => {
                // Log in a user and get their token
                const loginRes = await request(app)
                    .post("/api/users/login")
                    .send({ email: "john@example.com", password: "password123" });

                token = loginRes.body.accessToken;
                userId = loginRes.body._id;
            });

            it("should return all users except the logged-in user", async () => {
                const res = await request(app)
                    .get("/api/users/all") // Adjust to your actual route
                    .set("Authorization", `Bearer ${token}`);

                expect(res.status).to.equal(200);
                expect(res.body).to.be.an("array");

                const found = res.body.find(user => user._id === userId);
                expect(found).to.be.undefined; // Ensure current user is excluded
            });

            it("should return 401 if no token is provided", async () => {
                const res = await request(app).get("/api/users/all");
                expect(res.status).to.equal(401);
            });
        });

        describe("POST /api/users/storeToken", () => {
            let token;

            before(async () => {
                const loginRes = await request(app)
                    .post("/api/users/login")
                    .send({ email: "test@example.com", password: "password123" });

                token = loginRes.body.accessToken;
            });

            it("should store FCM token successfully", async () => {
                const res = await request(app)
                    .post("/api/users/storeToken")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ fcmToken: "sample_fcm_token_123" });

                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("message", "FCM token stored successfully");
                expect(res.body.user).to.have.property("fcmToken", "sample_fcm_token_123");
            });

            it("should return 400 if FCM token is missing", async () => {
                const res = await request(app)
                    .post("/api/users/storeToken")
                    .set("Authorization", `Bearer ${token}`)
                    .send({});

                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error", "FCM token is required");
            });

            it("should return 401 if auth token is missing", async () => {
                const res = await request(app)
                    .post("/api/users/storeToken")
                    .send({ fcmToken: "sample_fcm_token_123" });

                expect(res.status).to.equal(401); // Assuming your `protect` middleware handles this
            });
        });
        describe('PUT /api/users/edit', () => {
            let token;

            before(async () => {
                const loginRes = await request(app)
                    .post("/api/users/login")
                    .send({ email: "test@example.com", password: "password123" });

                token = loginRes.body.accessToken;
            });
            it('should update profile with valid data', async () => {
                // You can create a helper
                const res = await request(app)
                    .put('/api/users/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ username: 'newuser', city: 'Paris' });

                expect(res.status).to.equal(200);
                expect(res.body.user.username).to.equal('newuser');
                expect(res.body.user.city).to.equal('Paris');
            });

            it('should return 404 if user not found', async () => {
                const fakeUserId = new mongoose.Types.ObjectId();
                const token = jwt.sign(
                    { user: { id: fakeUserId } },
                    process.env.ACCESS_SECRET_TOKEN,
                    { expiresIn: '1h' }
                );

                const res = await request(app)
                    .put('/api/users/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ username: 'ghost' });

                expect(res.status).to.equal(404);
                expect(res.body.error).to.equal('User not found');
            });


            it('should fail without auth token', async () => {
                const res = await request(app)
                    .put('/api/users/edit')
                    .send({ username: 'noauth' });

                expect(res.status).to.equal(401);
            });
        });


    });
}

module.exports = userControllerTests;
