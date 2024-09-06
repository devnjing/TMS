const connection = require("../db");

// login -> /api/login
exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  connection.query("SELECT * FROM accounts WHERE username = ? AND password = ?", [username, password], (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    if (results.length < 1) {
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
};
