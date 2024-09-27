const express = require("express");
const router = express.Router();
const { isAuthorized, allowedGroups } = require("../middlewares/auth");
const { getTaskByTaskId, getNewTaskId, updateTaskAndEmail, addTask, createApplication, getApplications, addPlan, getPlansByAppAcronym, getApplicationByAppAcronym, getTasksByAppAcronym, getPlanColor, updateTask, updateApplication, checkPermits } = require("../controllers/taskManagementController");

//protected routes
//app management
router.route("/applications/by-permit").get(isAuthorized(), getApplications);
router.route("/applications").post(isAuthorized(), allowedGroups("pl"), createApplication);
router.route("/application").post(isAuthorized(), getApplicationByAppAcronym);
router.route("/application/update").post(isAuthorized(), allowedGroups("pl"), updateApplication);

//plan management
router.route("/plan").post(isAuthorized(), allowedGroups("pm"), addPlan);
router.route("/plans").post(isAuthorized(), getPlansByAppAcronym);
router.route("/plan/color").post(isAuthorized(), getPlanColor);

//task management
router.route("/task").post(isAuthorized(), addTask);
router.route("/tasks").post(isAuthorized(), getTasksByAppAcronym);
router.route("/task/update").post(isAuthorized(), updateTask);
router.route("/task/task-id").post(isAuthorized(), getNewTaskId);
router.route("/task/permits").post(isAuthorized(), checkPermits);
router.route("/task/details").post(isAuthorized(), getTaskByTaskId);

module.exports = router;
