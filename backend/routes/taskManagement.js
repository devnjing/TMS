const express = require("express");
const router = express.Router();
const { isAuthorized, allowedGroups } = require("../middlewares/auth");
const { addApplication, getApplications, getApplication, addPlan } = require("../controllers/taskManagementController");

//app management
router.route("/applications").get(isAuthorized(), getApplications);
router.route("/applications").post(isAuthorized(), addApplication);
router.route("/application").post(isAuthorized(), getApplication);

//plan management
router.route("/plan").post(isAuthorized(), addPlan);

//task management

module.exports = router;
