const connection = require("../db");

// add user -> api/users/add
exports.addUser = async (req, res) => {
  const { username, password, email, user_group } = req.body;
  connection.query("START TRANSACTION");

  connection.query("INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)", [username, password, email], (err, results) => {
    if (err) {
      connection.query("ROLLBACK");
      console.error(err);
      res.status(500).send({ message: "Error occurred" });
    } else {
      const userId = results.insertId;
      connection.query("INSERT INTO usergroup (user_group, username) VALUES (?, ?)", [user_group, username], (err, results) => {
        if (err) {
          connection.query("ROLLBACK");
          console.error(err);
          res.status(500).send({ message: "Error occurred" });
        } else {
          connection.query("COMMIT");
          res.send({ message: "User created successfully" });
        }
      });
    }
  });
};
