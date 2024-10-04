const { executeQuery } = require("../db");
const bcrypt = require("bcrypt");

/* Status Codes */
class MsgCode {
  static SUCCESS = "SUCC2001";
  static INVALID_INPUT = "ERR4001";
  static ENTRY_EXISTS = "ERR4002";
  static INVALID_STATE_CHANGE = "ERR4003";
  static NOT_FOUND = "ERR4004";
  static INVALID_CREDENTIALS = "ERR4005"; // do not have credentials
  static NOT_AUTHORIZED = "ERR4006"; // do not have access rights
  static INTERNAL = "ERR5001";
  static UNHANDLED = "ERR6001";
}

exports.createTask = async (req, res) => {
  try {
    // reject any url with parameters
    if (Object.keys(req.query).length !== 0) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // reject body with additional fields
    const allowedFields = ["username", "password", "appAcronym", "taskName", "description", "taskNotes"];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    const { username, password, appAcronym, taskName, description, taskNotes, taskPlan } = req.body;
    // check mandatory fields
    if (!username || !password) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    if (!appAcronym || !taskName) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // check fields with regex
    const usernameRegex = /^[a-zA-Z0-9_]{1,50}$/;
    if (!usernameRegex.test(username)) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^\da-zA-Z]).{8,10}$/;
    if (!passwordRegex.test(password)) {
      return res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    }
    const appAcronymRegex = /^[a-zA-Z0-9_]{1,50}$/;
    if (!appAcronymRegex.test(appAcronym)) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }
    const taskNameRegex = /^.{1,255}$/;
    if (!taskNameRegex.test(taskName)) {
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
      return res.status(401).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    await executeQuery("START TRANSACTION");

    //check create permit
    const queryCreatePermit = "SELECT App_permit_Create FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE";
    const paramsCreatePermit = [appAcronym];
    const createPermit = await executeQuery(queryCreatePermit, paramsCreatePermit);

    const queryUserInGroup = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
    const paramsUserInGroup = [username, createPermit[0].App_permit_Create];
    const resultsUserInGroup = await executeQuery(queryUserInGroup, paramsUserInGroup);

    if (resultsUserInGroup.length === 0) {
      return res.status(401).json({ msgCode: MsgCode.NOT_AUTHORIZED });
    }

    // create taskId
    const queryTaskId = `SELECT CONCAT(App_Acronym, '_', App_Rnumber) AS taskId 
                        FROM application WHERE App_Acronym = ? FOR UPDATE`;
    const paramsTaskId = [appAcronym];
    const resultsTaskId = await executeQuery(queryTaskId, paramsTaskId);
    const taskId = resultsTaskId[0].taskId;

    // check if id already exists
    const queryCheckId = "SELECT * FROM task WHERE Task_id = ?";
    const paramsCheckId = [taskId];
    const resultsCheckId = await executeQuery(queryCheckId, paramsCheckId);
    if (resultsCheckId.length !== 0) {
      return res.status(400).json({ msgCode: MsgCode.ENTRY_EXISTS });
    }

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
    const stamp = `Commented by: ${username}\nTask state: Open\n${username} created task\nDatetime: ${datetimeStamp}`;
    if (taskNotes) {
      newTaskNotes = `${stamp}\n${taskNotes}`;
    } else {
      newTaskNotes = stamp;
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

    // get new task
    const queryGetTask = "SELECT * FROM task WHERE Task_id = ?";
    const paramsGetTask = [taskId];
    const resultsGetTask = await executeQuery(queryGetTask, paramsGetTask);
    const newTask = resultsGetTask[0];

    await executeQuery("COMMIT");
    res.status(200).json({ results: newTask, msgCode: MsgCode.SUCCESS });
  } catch (error) {
    // catches execute query errors
    console.log(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
  }
};

exports.getTaskByState = async (req, res) => {
  try {
    // reject any url with parameters
    if (Object.keys(req.query).length !== 0) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    // reject body with additional fields
    const allowedFields = ["username", "password", "applicationAcronym", "taskState"];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
      return res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    }

    const { username, password, taskState, appAcronym } = req.body;
    // check mandatory fields
    if (!username || !password || !appAcronym || !taskState) {
      return res.status(400).json({ error: "Bad Request", message: "Missing mandatory fields: username, password, applicationAcronym, taskState", code: 400 });
    }

    // authentication
    const queryGetUser = "SELECT * FROM accounts WHERE username = ?";
    const paramsGetUser = [username];
    const resultsGetUser = await executeQuery(queryGetUser, paramsGetUser);
    if (resultsGetUser.length === 0) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid username or password", code: 401 });
    }
    const user = resultsGetUser[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid username or password", code: 401 });
    }

    // get task
    const queryGetTaskByState = "SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?";
    const paramsGetTaskByState = [taskState, appAcronym];
    const resultsGetTaskByState = await executeQuery(queryGetTaskByState, paramsGetTaskByState);
    if (resultsGetTaskByState.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Task not found", code: 404 });
    }

    res.status(200).json({ success: "Task retrieved successfully", task: resultsGetTaskByState[0], code: 200 });
  } catch (error) {
    // catch execute query errors
    res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve task", code: 500 });
  }
};

exports.promoteTask2Done = async (req, res) => {
  const { username, password, taskId, appAcronym } = req.body;
  try {
    // check mandatory fields
    if (!username || !password || !appAcronym || !taskId) {
      return res.status(400).json({ error: "Bad Request", message: "Missing mandatory fields: username, password, applicationAcronym, taskName", code: 400 });
    }

    // authentication
    const queryGetUser = "SELECT * FROM accounts WHERE username = ?";
    const paramsGetUser = [username];
    const resultsGetUser = await executeQuery(queryGetUser, paramsGetUser);
    if (resultsGetUser.length === 0) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid username or password", code: 401 });
    }
    const user = resultsGetUser[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid username or password", code: 401 });
    }

    // promote task
    const queryPromoteTask = "UPDATE task SET Task_state = 'Done' WHERE Task_id = ? AND Task_app_Acronym = ?";
    const paramsPromoteTask = [taskId, appAcronym];
    await executeQuery(queryPromoteTask, paramsPromoteTask);

    // send email
    const queryGetEmails = `SELECT a.email FROM accounts a 
    JOIN usergroup u ON u.username = a.username
    JOIN application app ON u.user_group = app.App_permit_Done
    WHERE app.App_Acronym = ?`;
    const paramsGetEmails = [task.Task_app_Acronym];
    const users = await executeQuery(queryGetEmails, paramsGetEmails);
    const recipients = users.filter(user => user.email !== "").map(user => user.email);
    const subject = `Task ID: ${taskId} has been completed.`;
    const text = `${taskName} has been completed and promoted to done.`;
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

    res.status(200).json({ success: "Task promoted successfully", task_id: taskId, code: 200 });
  } catch (error) {
    // catch execute query errors
    res.status(500).json({ error: "Internal Server Error", message: "Failed to promote task", code: 500 });
  }
};
