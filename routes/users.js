const express = require("express");
const router = express.Router();
const userController = require("../app/api/controllers/users");

router.post("/register", userController.create);
router.post("/authenticate", userController.authenticate);
router.post("/confirmation", userController.confirmation);
module.exports = router;
