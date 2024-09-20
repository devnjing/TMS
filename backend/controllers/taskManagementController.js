const { executeQuery } = require("../db");

exports.addApplication = async (req, res) => {
  const { application } = req.body;
  console.log(application);
  const startDate = new Date(application.App_startDate);
  const epochStartDate = Math.floor(startDate.getTime() / 1000);
  const endDate = new Date(application.App_endDate);
  const epochEndDate = Math.floor(endDate.getTime() / 1000);
  const jsonCreate = JSON.stringify(application.App_permit_Create);
  const jsonOpen = JSON.stringify(application.App_permit_Open);
  const jsonToDo = JSON.stringify(application.App_permit_toDoList);
  const jsonDoing = JSON.stringify(application.App_permit_Doing);
  const jsonDone = JSON.stringify(application.App_permit_Done);
  const query = "INSERT INTO application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [application.App_Acronym, application.App_Description, application.App_Rnumber, epochStartDate, epochEndDate, jsonCreate, jsonOpen, jsonToDo, jsonDoing, jsonDone];
  console.log(params);
  try {
    await executeQuery(query, params);
    res.status(200).json({ success: "Application created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create application" });
  }
};

exports.getApplications = async (req, res) => {
  const query = "SELECT * FROM application";
  try {
    const applications = await executeQuery(query);
    for (app of applications) {
      app.App_startDate = new Date(app.App_startDate * 1000);
      app.App_startDate = app.App_startDate.toLocaleDateString();
      app.App_endDate = new Date(app.App_endDate * 1000);
      app.App_endDate = app.App_endDate.toLocaleDateString();
    }
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to get applications" });
  }
};

exports.getApplication = async (req, res) => {
  const { App_Acronym } = req.body;
  const query = "SELECT * FROM Application WHERE App_Acronym = ?";
  const params = [App_Acronym];
  try {
    const application = await executeQuery(query, params);
    console.log(application[0]);
    res.status(200).json(application[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to get application" });
  }
};

exports.addPlan = async (req, res) => {
  const { plan } = req.body;
  console.log(plan.Plan_startDate);
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
