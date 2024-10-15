const { executeQuery } = require("../db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
/* Status Codes */
class MsgCode {
  static SUCCESS = "SUCC2001";
  static INVALID_KEY = "ERR4001";
  static INVALID_INPUT = "ERR4002";
  static INVALID_STATE_CHANGE = "ERR4003";
  static NOT_FOUND = "ERR4004";
  static INVALID_CREDENTIALS = "ERR4005"; // do not have credentials
  static NOT_AUTHORIZED = "ERR4006"; // do not have access rights
  static INTERNAL = "ERR5001";
}

exports.createTask = async (req, res) => {
  try {
    // reject body with additional fields
    const allowedFields = ["username", "password", "appAcronym", "taskName", "taskNotes", "description", "taskPlan"];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
    }

    const { username, password, appAcronym, taskName, description, taskNotes, taskPlan } = req.body;

    // check field length
    if (taskName.length < 1 || taskName.length > 255) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // check mandatory fields
    if (!username || !password) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }
    if (!appAcronym || !taskName) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // authentication
    const queryGetUser = "SELECT accountStatus, password FROM accounts WHERE username = ?";
    const paramsGetUser = [username];
    const resultsGetUser = await executeQuery(queryGetUser, paramsGetUser);
    if (resultsGetUser.length === 0) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const user = resultsGetUser[0];
    if (user.accountStatus !== "active") {
      console.log("error");
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }

    await executeQuery("START TRANSACTION");
    // check acronym
    const queryAppAcronym = "SELECT * FROM application WHERE App_Acronym = ?";
    const paramsAppAcronym = [appAcronym];
    const resultsAppAcronym = await executeQuery(queryAppAcronym, paramsAppAcronym);
    if (resultsAppAcronym.length === 0) {
      return res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    }

    //check create permit
    const queryCreatePermit = "SELECT App_permit_Create FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE";
    const paramsCreatePermit = [appAcronym];
    const createPermit = await executeQuery(queryCreatePermit, paramsCreatePermit);
    const queryUserInGroup = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
    const paramsUserInGroup = [username, createPermit[0].App_permit_Create];
    const resultsUserInGroup = await executeQuery(queryUserInGroup, paramsUserInGroup);
    if (resultsUserInGroup.length === 0) {
      return res.status(403).json({ msgCode: MsgCode.NOT_AUTHORIZED });
    }

    // create taskId
    const queryTaskId = `SELECT CONCAT(App_Acronym, '_', App_Rnumber) AS taskId 
                        FROM application WHERE App_Acronym = ? FOR UPDATE`;
    const paramsTaskId = [appAcronym];
    const resultsTaskId = await executeQuery(queryTaskId, paramsTaskId);
    const taskId = resultsTaskId[0].taskId;

    // create stamp for notes
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const hour = currentDate.getHours().toString().padStart(2, "0");
    const minute = currentDate.getMinutes().toString().padStart(2, "0");
    const second = currentDate.getSeconds().toString().padStart(2, "0");
    const datetimeStamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

    let newTaskNotes;
    // stamp new note
    const stamp = `Commented by: ${username}\n[Task state: Open]\n${username} created task\nDatetime: ${datetimeStamp}`;
    if (taskNotes) {
      newTaskNotes = `${stamp}\n${taskNotes}`;
    } else {
      newTaskNotes = stamp;
    }
    if (taskPlan === "") {
      taskPlan = null;
    }
    // check if plan exists
    if (taskPlan && taskPlan !== null) {
      const queryCheckPlan = "SELECT * FROM plan WHERE Plan_MVP_name = ?";
      const paramsCheckPlan = [taskPlan];
      const resultsCheckPlan = await executeQuery(queryCheckPlan, paramsCheckPlan);
      if (resultsCheckPlan.length === 0) {
        return res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
      }
    }

    // create task
    const now = new Date();
    const epochCreateDate = Math.floor(now.getTime() / 1000);
    const queryAddTask = `INSERT INTO task 
                        (Task_id, Task_plan, Task_app_Acronym, Task_name, Task_description, 
                        Task_notes, Task_state, Task_creator, Task_owner, Task_createDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const paramsAddTask = [taskId, taskPlan, appAcronym, taskName, description, newTaskNotes, "Open", username, username, epochCreateDate];
    await executeQuery(queryAddTask, paramsAddTask);

    // update r number
    const queryUpdateRnumber = "UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?";
    const paramsUpdateRnumber = [appAcronym];
    await executeQuery(queryUpdateRnumber, paramsUpdateRnumber);

    await executeQuery("COMMIT");
    res.status(200).json({ results: { Task_id: taskId }, msgCode: MsgCode.SUCCESS });
  } catch (error) {
    // catches execute query errors
    await executeQuery("ROLLBACK");
    console.log(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
  }
};

exports.getTaskByState = async (req, res) => {
  try {
    // reject body with additional fields
    const allowedFields = ["username", "password", "taskState", "appAcronym"];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
    }

    const { username, password, taskState, appAcronym } = req.body;
    // check mandatory fields
    if (!username || !password) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }
    if (!appAcronym || !taskState) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // authentication
    const queryGetUser = "SELECT * FROM accounts WHERE username = ?";
    const paramsGetUser = [username];
    const resultsGetUser = await executeQuery(queryGetUser, paramsGetUser);
    if (resultsGetUser.length === 0) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const user = resultsGetUser[0];
    if (user.accountStatus !== "active") {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }

    // get tasks
    const validTaskStates = ["open", "todo", "doing", "done", "closed"];
    if (!validTaskStates.includes(taskState)) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    const queryGetTaskByState = "SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?";
    const paramsGetTaskByState = [taskState, appAcronym];
    const resultsGetTaskByState = await executeQuery(queryGetTaskByState, paramsGetTaskByState);
    if (resultsGetTaskByState.length === 0) {
      return res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    }

    res.status(200).json({ results: resultsGetTaskByState, msgCode: MsgCode.SUCCESS });
  } catch (error) {
    // catch execute query errors
    res.error(500).json({ msgCode: MsgCode.INTERNAL });
  }
};

exports.promoteTask2Done = async (req, res) => {
  try {
    // reject body with additional fields
    const allowedFields = ["username", "password", "appAcronym", "taskId", "taskNotes"];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
    }

    const { username, password, appAcronym, taskId, taskNotes } = req.body;

    // check mandatory fields
    if (!username || !password) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }
    if (!appAcronym || !taskId) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // authentication
    const queryGetUser = "SELECT * FROM accounts WHERE username = ?";
    const paramsGetUser = [username];
    const resultsGetUser = await executeQuery(queryGetUser, paramsGetUser);
    if (resultsGetUser.length === 0) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const user = resultsGetUser[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }

    // check if task exists
    const queryGetTaskById = "SELECT * FROM task WHERE Task_id = ? AND Task_app_Acronym = ?";
    const paramsGetTaskById = [taskId, appAcronym];
    const resultsGetTaskById = await executeQuery(queryGetTaskById, paramsGetTaskById);
    if (resultsGetTaskById.length === 0) {
      return res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    }

    // check doing permit
    const queryDoingPermit = "SELECT App_permit_Doing FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE";
    const paramsDoingPermit = [appAcronym];
    const doingPermit = await executeQuery(queryDoingPermit, paramsDoingPermit);
    const queryUserInGroup = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
    const paramsUserInGroup = [username, doingPermit[0].App_permit_Doing];
    const resultsUserInGroup = await executeQuery(queryUserInGroup, paramsUserInGroup);
    if (resultsUserInGroup.length === 0) {
      return res.status(403).json({ msgCode: MsgCode.NOT_AUTHORIZED });
    }

    // check previous state
    const queryGetTask = "SELECT Task_state FROM task WHERE Task_id = ?";
    const paramsGetTask = [taskId];
    const resultsGetTask = await executeQuery(queryGetTask, paramsGetTask);
    const oldTask = resultsGetTask[0];
    if (oldTask.Task_state !== "Doing") {
      return res.status(400).json({ msgCode: MsgCode.INVALID_STATE_CHANGE });
    }

    // get old notes
    const queryGetOldNotes = "SELECT Task_notes FROM task WHERE Task_id = ?";
    const paramsGetOldNotes = [taskId];
    const resultsGetOldNotes = await executeQuery(queryGetOldNotes, paramsGetOldNotes);
    const oldNotes = resultsGetOldNotes[0].Task_notes;

    // create stamp for notes
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const hour = currentDate.getHours().toString().padStart(2, "0");
    const minute = currentDate.getMinutes().toString().padStart(2, "0");
    const second = currentDate.getSeconds().toString().padStart(2, "0");
    const datetimeStamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

    let newTaskNotes;
    // stamp new note
    const stamp = `Action by: ${username}\n[Task state: Doing to Done]\nDatetime: ${datetimeStamp}`;
    if (taskNotes) {
      newTaskNotes = `${stamp}\n${taskNotes}\n\n${oldNotes}`;
    } else {
      newTaskNotes = `${stamp}\n\n${oldNotes}`;
    }

    await executeQuery("START TRANSACTION");
    // promote task
    const queryPromoteTask = "UPDATE task SET Task_state = 'Done', Task_notes = ? WHERE Task_id = ? AND Task_app_Acronym = ?";
    const paramsPromoteTask = [newTaskNotes, taskId, appAcronym];
    await executeQuery(queryPromoteTask, paramsPromoteTask);

    // send email
    const queryGetEmails = `SELECT a.email FROM accounts a 
    JOIN usergroup u ON u.username = a.username
    JOIN application app ON u.user_group = app.App_permit_Done
    WHERE app.App_Acronym = ?`;
    const paramsGetEmails = [appAcronym];
    const users = await executeQuery(queryGetEmails, paramsGetEmails);
    const recipients = users.filter(user => user.email !== "").map(user => user.email);
    const subject = `Task ID: ${taskId} has been completed.`;
    const text = `${taskId} has been completed and promoted to done.`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(", "),
      subject: subject,
      text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    await executeQuery("COMMIT");
    res.status(200).json({ results: { Task_id: taskId, Task_state: "Done" }, msgCode: MsgCode.SUCCESS });
  } catch (error) {
    // catch execute query errors
    await executeQuery("ROLLBACK");
    console.log(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
  }
};
