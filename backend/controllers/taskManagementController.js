const jwt = require("jsonwebtoken");
const { executeQuery } = require("../db");
const nodemailer = require("nodemailer");

// GET api/applications/by-permit
exports.getApplications = async (req, res) => {
  try {
    const username = await getUNameFromToken(req.cookies.token);
    const query = `SELECT DISTINCT a.* FROM application a JOIN usergroup u 
                  ON u.user_group = a.App_permit_Create
                  OR u.user_group = a.App_permit_Open
                  OR u.user_group = a.App_permit_toDoList
                  OR u.user_group = a.App_permit_Doing
                  OR u.user_group = a.App_permit_Done
                  WHERE u.username = ?`;
    const params = [username];
    const applications = await executeQuery(query, params);
    for (app of applications) {
      // convert from epoch to date
      app.App_startDate = new Date(app.App_startDate * 1000);
      app.App_startDate = formatDateYYYYMMDD(app.App_startDate);
      app.App_endDate = new Date(app.App_endDate * 1000);
      app.App_endDate = formatDateYYYYMMDD(app.App_endDate);
    }
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to get applications" });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const { application } = req.body;
    // check mandatory fields
    if (!application.App_Acronym || !application.App_Rnumber || !application.App_startDate || !application.App_endDate) {
      return res.status(500).json({ error: "Missing mandatory fields: App Acronym, R Number, Start Date, End Date" });
    }
    // check if App_Acronym already exists
    let query = "SELECT * FROM application WHERE App_Acronym = ?";
    let params = [application.App_Acronym];
    const result = await executeQuery(query, params);
    if (result.length > 0) {
      return res.status(500).json({ error: "Application already exists" });
    }

    // check acronym regex
    const acronymRegex = /^[a-zA-Z0-9_]{1,50}$/;
    if (!acronymRegex.test(application.App_Acronym)) {
      return res.status(500).json({ error: "Invalid Acronym" });
    }

    // check rnumber
    if (!(application.App_Rnumber > 0)) {
      return res.status(500).json({ error: "Invalid Rnumber" });
    }

    // convert from date to epoch
    const startDate = new Date(application.App_startDate);
    const epochStartDate = Math.floor(startDate.getTime() / 1000);
    const endDate = new Date(application.App_endDate);
    const epochEndDate = Math.floor(endDate.getTime() / 1000);

    query = `INSERT INTO application 
      (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, 
      App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    params = [application.App_Acronym, application.App_Description, application.App_Rnumber, epochStartDate, epochEndDate, application.App_permit_Create, application.App_permit_Open, application.App_permit_toDoList, application.App_permit_Doing, application.App_permit_Done];
    await executeQuery(query, params);

    return res.status(200).json({ success: "Application created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create application" });
  }
};

exports.getApplicationByAppAcronym = async (req, res) => {
  const { App_Acronym } = req.body;
  const query = "SELECT * FROM Application WHERE App_Acronym = ?";
  const params = [App_Acronym];
  try {
    const application = await executeQuery(query, params);
    application[0].App_startDate = new Date(application[0].App_startDate * 1000);
    application[0].App_startDate = formatDateYYYYMMDD(application[0].App_startDate);
    application[0].App_endDate = new Date(application[0].App_endDate * 1000);
    application[0].App_endDate = formatDateYYYYMMDD(application[0].App_endDate);
    res.status(200).json(application[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to get application" });
  }
};

exports.addPlan = async (req, res) => {
  const { plan } = req.body;

  // check mandatory fields
  if (!plan.Plan_MVP_name || !plan.Plan_startDate || !plan.Plan_endDate || !plan.Plan_color) {
    return res.status(500).json({ error: "Missing mandatory fields: Plan MVP name, Start Date, End Date, Color" });
  }

  // check plan length
  if (plan.Plan_MVP_name.length < 0 || plan.Plan_MVP_name.length > 100) {
    return res.status(500).json({ error: "Invalid plan name" });
  }

  const epochStartDate = Math.floor(new Date(plan.Plan_startDate).getTime() / 1000);
  const epochEndDate = Math.floor(new Date(plan.Plan_endDate).getTime() / 1000);
  const query = "INSERT INTO plan (Plan_MVP_name, Plan_app_Acronym, Plan_startDate, Plan_endDate, Plan_color) VALUES (?, ?, ?, ?, ?)";
  const params = [plan.Plan_MVP_name, plan.Plan_app_Acronym, epochStartDate, epochEndDate, plan.Plan_color];
  try {
    await executeQuery(query, params);
    res.status(200).json({ success: "Plan created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create plan" });
  }
};

exports.getPlansByAppAcronym = async (req, res) => {
  const { App_Acronym } = req.body;
  const query = "SELECT Plan_MVP_name FROM plan WHERE Plan_app_Acronym = ?";
  const params = [App_Acronym];
  try {
    const plans = await executeQuery(query, params);
    const planNames = plans.map(plan => plan.Plan_MVP_name);

    res.status(200).json({ planNames });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get plans" });
  }
};

exports.addTask = async (req, res) => {
  try {
    await executeQuery("START TRANSACTION");
    const { task } = req.body;
    const username = await getUNameFromToken(req.cookies.token);

    //check create permit
    const query = "SELECT App_permit_Create FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE";
    const params = [task.Task_app_Acronym];
    const createPermit = await executeQuery(query, params);
    const hasCreatePermit = await checkGroup(username, createPermit[0].App_permit_Create);
    if (!hasCreatePermit) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // check mandatory fields
    if (!task.Task_name) {
      return res.status(500).json({ error: "Missing mandatory fields: Task name" });
    }

    // check field lengths
    if (task.Task_name.length < 0 || task.Task_name.length > 100 || (task.Task_description && task.Task_description < 1 && task.Task_description.length > 255)) {
      return res.status(500).json({ error: "Invalid task name" });
    }

    const datetimestamp = createDatetimeStamp();
    // stamp new note
    const stamp = `Commented by: ${username}\nTask state: ${task.Task_state}\n${username} created task\nDatetime: ${datetimestamp}`;
    if (task.newNote) {
      task.Task_notes = `${stamp}\n${task.newNote}`;
    } else {
      task.Task_notes = stamp;
    }

    // create taskId
    const queryTaskId = `SELECT CONCAT(App_Acronym, '_', App_Rnumber) AS taskId 
                        FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE`;
    const paramsTaskId = [task.Task_app_Acronym];
    const results = await executeQuery(queryTaskId, paramsTaskId);
    const taskId = results[0].taskId;

    // convert date to epoch
    const convertedDate = task.Task_createDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
    const createDate = new Date(convertedDate);
    const epochCreateDate = Math.floor(createDate.getTime() / 1000);

    // add task
    const queryAddTask = `INSERT INTO task 
                        (Task_id, Task_plan, Task_app_Acronym, Task_name, Task_description, 
                        Task_notes, Task_state, Task_creator, Task_owner, Task_createDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const paramsAddTask = [taskId, task.Task_plan, task.Task_app_Acronym, task.Task_name, task.Task_description, task.Task_notes, task.Task_state, task.Task_creator, task.Task_owner, epochCreateDate];
    await executeQuery(queryAddTask, paramsAddTask);

    // update r number
    const queryUpdateRnumber = "UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?";
    const paramsUpdateRnumber = [task.Task_app_Acronym];
    await executeQuery(queryUpdateRnumber, paramsUpdateRnumber);

    await executeQuery("COMMIT");
    res.status(200).json({ success: "Task created successfully" });
  } catch (error) {
    await executeQuery("ROLLBACK");
    console.log(error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

exports.getTasksByAppAcronym = async (req, res) => {
  const { App_Acronym } = req.body;
  const query = "SELECT * FROM task WHERE Task_app_Acronym = ?";
  const params = [App_Acronym];
  try {
    const tasks = await executeQuery(query, params);
    for (task of tasks) {
      // convert from epoch to date
      task.Task_createDate = new Date(task.Task_createDate * 1000);
      task.Task_createDate = formatDateDDMMYYYY(task.Task_createDate);
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

exports.getPlanColor = async (req, res) => {
  const { Plan_MVP_name } = req.body;
  const query = "SELECT Plan_color FROM plan WHERE Plan_MVP_name = ?";
  const params = [Plan_MVP_name];
  try {
    const color = await executeQuery(query, params);
    if (color[0]) {
      return res.status(200).json(color[0].Plan_color);
    } else {
      return res.status(200).json("#000000");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get plan color" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { task } = req.body;
    const username = await getUNameFromToken(req.cookies.token);

    // get old task
    const oldTask = await getTask(task.Task_id);

    // check permits
    await executeQuery("START TRANSACTION");
    const query = `SELECT App_permit_Open, App_permit_ToDoList, App_permit_Doing, App_permit_Done 
                  FROM application WHERE App_Acronym = ? LOCK IN SHARE MODE`;
    const params = [task.Task_app_Acronym];
    const permissions = await executeQuery(query, params);

    const hasOpenPermit = await checkGroup(username, permissions[0].App_permit_Open);
    const hasToDoListPermit = await checkGroup(username, permissions[0].App_permit_ToDoList);
    const hasDoingPermit = await checkGroup(username, permissions[0].App_permit_Doing);
    const hasDonePermit = await checkGroup(username, permissions[0].App_permit_Done);
    if ((oldTask.Task_state === "Open" && !hasOpenPermit) || (oldTask.Task_state === "Todo" && !hasToDoListPermit) || (oldTask.Task_state === "Doing" && !hasDoingPermit) || (oldTask.Task_state === "Done" && !hasDonePermit)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const datetimestamp = createDatetimeStamp();
    // stamp new note
    let stamp;
    if (oldTask.Task_state !== task.Task_state) {
      stamp = `Action by: ${username}\nTask state changed from ${oldTask.Task_state} to ${task.Task_state}\nDatetime: ${datetimestamp}`;
    } else {
      stamp = `Commented by: ${username}\nTask state: ${task.Task_state}\nDatetime: ${datetimestamp}`;
    }
    if (task.newNote) {
      if (task.Task_notes === null || task.Task_notes === "") {
        task.Task_notes = `${stamp}\n${task.newNote}`;
      } else {
        task.Task_notes = `${oldTask.Task_notes}\n\n${stamp}\n${task.newNote}`;
      }
    } else {
      task.Task_notes = `${task.Task_notes}\n\n${stamp}`;
    }

    // check promote/demote (demote: forfeit, reject)
    if ((task.Task_state === "Todo" && oldTask.Task_state === "Doing") || (task.Task_state === "Doing" && oldTask.Task_state === "Done")) {
      task.Task_owner = oldTask.Task_owner;
    }

    // update task query
    const queryUpdateTask = "UPDATE task SET Task_plan = ?, Task_notes = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?";
    const paramsUpdateTask = [task.Task_plan, task.Task_notes, task.Task_state, task.Task_owner, task.Task_id];
    await executeQuery(queryUpdateTask, paramsUpdateTask);

    const oldState = oldTask.Task_state;
    if (oldState === "Doing" && task.Task_state === "Done") {
      // do email query
      const queryGetEmails = `SELECT a.email FROM accounts a 
                      JOIN usergroup u ON u.username = a.username 
                      JOIN application app ON u.user_group = app.App_permit_Done
                      WHERE app.App_Acronym = ?`;
      const paramsGetEmails = [task.Task_app_Acronym];
      const users = await executeQuery(queryGetEmails, paramsGetEmails);
      const emails = users.map(email => email.email);
      // email users in permit_Done
      sendEmail([emails], "Task Completed", `Your task ${task.Task_name} has been completed.`);
    }
    await executeQuery("COMMIT");
    res.status(200).json({ success: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    await executeQuery("ROLLBACK");
    res.status(500).json({ error: "Failed to update task" });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { application } = req.body;

    // check mandatory fields
    if (!application.App_startDate || !application.App_endDate) {
      return res.status(500).json({ error: "Missing mandatory fields" });
    }

    // format dates
    const startDate = new Date(application.App_startDate);
    const epochStartDate = Math.floor(startDate.getTime() / 1000);
    const endDate = new Date(application.App_endDate);
    const epochEndDate = Math.floor(endDate.getTime() / 1000);

    const query = `UPDATE application SET App_startDate = ?, App_endDate = ?, 
                  App_Description = ?, App_permit_Create = ?, App_permit_Open = ?, 
                  App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ? 
                  WHERE App_Acronym = ?`;
    const params = [epochStartDate, epochEndDate, application.App_Description, application.App_permit_Create, application.App_permit_Open, application.App_permit_toDoList, application.App_permit_Doing, application.App_permit_Done, application.App_Acronym];
    await executeQuery(query, params);
    res.status(200).json({ success: "Application updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update application" });
  }
};

exports.checkPermits = async (req, res) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized no token" });
    }
    // decode token and find user
    const decoded = await decodeToken(req.cookies.token);
    const username = decoded.username;
    const { App_Acronym } = req.body;

    // retrieve app permissions
    const query = `SELECT App_permit_Create, App_permit_Open, App_permit_toDoList, 
                  App_permit_Doing, App_permit_Done FROM application 
                  WHERE App_Acronym = ?`;
    const params = [App_Acronym];
    const appPermissions = await executeQuery(query, params);

    // check if user has permissions
    const hasCreatePermit = await checkGroup(username, appPermissions[0].App_permit_Create);
    const hasOpenPermit = await checkGroup(username, appPermissions[0].App_permit_Open);
    const hasToDoListPermit = await checkGroup(username, appPermissions[0].App_permit_toDoList);
    const hasDoingPermit = await checkGroup(username, appPermissions[0].App_permit_Doing);
    const hasDonePermit = await checkGroup(username, appPermissions[0].App_permit_Done);
    const hasPermits = {
      hasCreatePermit,
      hasOpenPermit,
      hasToDoListPermit,
      hasDoingPermit,
      hasDonePermit
    };

    res.status(200).json(hasPermits);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to check permits" });
  }
};

exports.getTaskByTaskId = async (req, res) => {
  const { taskId } = req.body;
  try {
    const query = "SELECT * FROM task WHERE Task_id = ?";
    const params = [taskId];
    const results = await executeQuery(query, params);
    res.status(200).json(results[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get task by task id" });
  }
};

/*--------------------------------------------------------------------functions---------------------------------------------------------*/
async function checkGroup(username, groupName) {
  const query = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
  const params = [username, groupName];
  try {
    const results = await executeQuery(query, params);
    return results.length > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function decodeToken(token) {
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      console.log(error);
    }
  }
}

function formatDateYYYYMMDD(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function sendEmail(recipients, subject, text) {
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
  // console.log("mock emailing");
}

async function getUNameFromToken(token) {
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.username;
    } catch (error) {
      console.log(error);
    }
  }
}

function createDatetimeStamp() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const hour = currentDate.getHours().toString().padStart(2, "0");
  const minute = currentDate.getMinutes().toString().padStart(2, "0");
  const second = currentDate.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

async function getTask(taskId) {
  try {
    const query = "SELECT * FROM task WHERE Task_id = ?";
    const params = [taskId];
    const results = await executeQuery(query, params);
    return results[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}
