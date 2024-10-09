const express = require("express");
const router = express.Router();
const { createTask, getTaskByState, promoteTask2Done } = require("../controllers/demoController");

class MsgCode {
  static INVALID_URL = "ERR3001";
  static INVALID_PARAMETERS = "ERR3002";
}
const whitelist = ["/api/demo/CreateTask", "/api/demo/GetTaskByState", "/api/demo/promotetask2done"];
router.use((req, res, next) => {
  console.log(req.originalUrl);

  // reject any url with parameters
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).json({ msgCode: MsgCode.INVALID_PARAMETERS });
  }
  if (!whitelist.includes(req.originalUrl)) {
    return res.status(403).send({ msgCode: MsgCode.INVALID_URL });
  }

  next();
});

router.route("/CreateTask").post(createTask);
router.route("/GetTaskByState").post(getTaskByState);
router.route("/promoteTask2Done").post(promoteTask2Done);

module.exports = router;
