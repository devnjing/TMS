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

function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { executeQuery };
