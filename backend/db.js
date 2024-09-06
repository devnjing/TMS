const mysql = require("mysql2");

const dbConfig = {
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "tms"
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

module.exports = connection;
