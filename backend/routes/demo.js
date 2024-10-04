const express = require("express");
const router = express.Router();
const { createTask, getTaskByState, promoteTask2Done } = require("../controllers/demoController");

router.route("/CreateTask").post(createTask);
router.route("/GetTaskByState").post(getTaskByState);
router.route("/promoteTask2Done").post(promoteTask2Done);

module.exports = router;
