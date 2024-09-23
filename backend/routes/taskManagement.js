const express = require("express");
const router = express.Router();
const { isAuthorized, allowedGroups } = require("../middlewares/auth");
const { addTask, addApplication, getApplications, addPlan, getPlansByAppAcronym, getApplicationByAppAcronym, getTasksByAppAcronym, getPlanColor, updateTask, updateApplication, checkPermits } = require("../controllers/taskManagementController");

//app management
router.route("/applications").get(isAuthorized(), getApplications);
router.route("/applications").post(isAuthorized(), addApplication);
router.route("/application").post(isAuthorized(), getApplicationByAppAcronym);
router.route("/application/update").post(isAuthorized(), updateApplication);

//plan management
router.route("/plan").post(isAuthorized(), addPlan);
router.route("/plans").post(isAuthorized(), getPlansByAppAcronym);
router.route("/plan/color").post(isAuthorized(), getPlanColor);

//task management
router.route("/task").post(isAuthorized(), addTask);
router.route("/tasks").post(isAuthorized(), getTasksByAppAcronym);
router.route("/task/update").post(isAuthorized(), updateTask);
router.route("task/permits").post(isAuthorized(), checkPermits);

module.exports = router;
