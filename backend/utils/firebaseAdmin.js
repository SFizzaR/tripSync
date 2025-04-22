const admin = require("firebase-admin");

// Load your Firebase service account key
const serviceAccount = require("../configs/serviceAccount.json"); // Replace with your actual file path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;