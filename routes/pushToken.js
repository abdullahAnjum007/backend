const express = require("express");
const { savePushToken } = require("../Controllers/pushToken");

const router = express.Router();

router.post("/users/push-token", savePushToken);

module.exports = router;
