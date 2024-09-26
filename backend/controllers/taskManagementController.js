const jwt = require("jsonwebtoken");
const { executeQuery } = require("../db");
const nodemailer = require("nodemailer");

exports.addApplication = async (req, res) => {
  try {
    const { application } = req.body;
    // check mandatory fields
    if (!application.App_Acronym || !application.App_Rnumber || !application.App_startDate || !application.App_endDate) {
      return res.status(500).json({ error: "Missing mandatory fields" });
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

exports.getApplications = async (req, res) => {
  const { username } = req.body;
  console.log(username);
  const query = `SELECT a.* FROM application a JOIN usergroup u 
                ON u.user_group = a.App_permit_Create
                OR u.user_group = a.App_permit_Open
                OR u.user_group = a.App_permit_toDoList
                OR u.user_group = a.App_permit_Doing
                OR u.user_group = a.App_permit_Done
                WHERE u.username = ?`;
  const params = [username];
  try {
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
  const { task } = req.body;
  const convertedDate = task.Task_createDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
  const createDate = new Date(convertedDate);
  const epochCreateDate = Math.floor(createDate.getTime() / 1000);
  const query = "INSERT INTO task (Task_id, Task_plan, Task_app_Acronym, Task_name, Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [task.Task_id, task.Task_plan, task.Task_app_Acronym, task.Task_name, task.Task_description, task.Task_notes, task.Task_state, task.Task_creator, task.Task_owner, epochCreateDate];
  try {
    await executeQuery(query, params);
    await executeQuery("UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?", [task.Task_app_Acronym]);
    res.status(200).json({ success: "Task created successfully" });
  } catch (error) {
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
    res.status(200).json(color[0].Plan_color);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get plan color" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { task } = req.body;
    const query = "UPDATE task SET Task_name = ?, Task_description = ?, Task_plan = ?, Task_notes = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?";
    const params = [task.Task_name, task.Task_description, task.Task_plan, task.Task_notes, task.Task_state, task.Task_owner, task.Task_id];
    await executeQuery(query, params);
    res.status(200).json({ success: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

exports.updateTaskAndEmail = async (req, res) => {
  try {
    const { task } = req.body;
    const query = "UPDATE task SET Task_name = ?, Task_description = ?, Task_plan = ?, Task_notes = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?";
    const params = [task.Task_name, task.Task_description, task.Task_plan, task.Task_notes, task.Task_state, task.Task_owner, task.Task_id];
    if (task.Task_state === "Done") {
      // get app permits
      const query2 = `SELECT a.email FROM accounts a 
                      JOIN usergroup u ON u.username = a.username 
                      JOIN application app ON u.user_group = app.App_permit_Done
                      WHERE app.App_Acronym = ?`;
      const params2 = [task.Task_app_Acronym];
      const users = await executeQuery(query2, params2);
      const emails = users.map(email => email.email);
      // email users in permit_Done
      sendEmail([emails], "Task Completed", `Your task ${task.Task_name} has been completed.`);
    }
    await executeQuery(query, params);
    res.status(200).json({ success: "Task updated successfully" });
  } catch (error) {
    console.log(error);
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

    const query = "UPDATE application SET App_startDate = ?, App_endDate = ?, App_Description = ?, App_permit_Create = ?, App_permit_Open = ?, App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ? WHERE App_Acronym = ?";
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
    const query = "SELECT App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM application WHERE App_Acronym = ?";
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
  console.log("sending email");
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
}
