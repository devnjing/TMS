const express = require("express");
const { addUser } = require("../controllers/accountsController");

const router = express.Router();

router.route("/add").post(addUser);

module.exports = router;
