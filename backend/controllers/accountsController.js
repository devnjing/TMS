const { executeQuery } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// login user -> post api/login/
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  // find user by username
  const user = await getUserByUname(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Bcrypt to check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // create token
  const token = jwt.sign({ username, ipAddress, userAgent }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });

  // cookie options
  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true
  };

  // send token with cookie
  res.status(200).cookie("token", token, options).json({
    success: true,
    token
  });
};

// get all users -> get /api/users/
exports.getUsers = async (req, res) => {
  // get accounts table
  let query = "SELECT * FROM accounts";
  try {
    let results = await executeQuery(query);
    res.status(200).json({ users: results });
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
};

// get all users with groups -> get /api/users/groups/
exports.getUsersWithGroups = async (req, res) => {
  // get accounts table
  let query = "SELECT * FROM accounts";
  try {
    let users = await executeQuery(query);
    query = "SELECT * FROM usergroup";
    let groups = await executeQuery(query);
    users.forEach(user => {
      user.groups = groups.filter(group => group.username === user.username).map(group => group.user_group);
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
};
// add user -> post api/users/
exports.addUser = async (req, res) => {
  const { username, password, email, user_group, accountStatus } = req.body;

  // find user by username to check if username exists
  const user = await getUserByUname(username);
  if (user) {
    return res.status(400).json({ error: "User already exists" });
  }

  // check password criteria
  const alphabetRegex = /[a-zA-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[^a-zA-Z0-9]/;
  if (!(alphabetRegex.test(password) && numberRegex.test(password) && specialCharRegex.test(password) && password.length >= 8 && password.length <= 10)) {
    return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
  }

  // bcrypt to hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // add user to database
  var query = "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)";
  var params = [username, hashedPassword, email, accountStatus];
  try {
    await executeQuery(query, params);
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }

  // add user to user_group table
  query = "INSERT INTO usergroup (username, user_group) VALUES (?, ?)";
  params = [username, user_group];
  try {
    await executeQuery(query, params);
    res.json({ success: true, message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add user to user_group table" });
  }
};

// change password -> post /api/users/password/
exports.changePassword = async (req, res) => {
  const { username, password } = req.body;

  // find user by username
  const user = await getUserByUname(username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // check password criteria
  const alphabetRegex = /[a-zA-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[^a-zA-Z0-9]/;
  if (!(alphabetRegex.test(password) && numberRegex.test(password) && specialCharRegex.test(password) && password.length >= 8) && password.length <= 10) {
    return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
  }

  // bcrypt to hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // update password in database
  var query = "UPDATE accounts SET password = ? WHERE username = ?";
  var params = [hashedPassword, username];
  try {
    await executeQuery(query, params);
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }

  res.json({ success: true, message: "Password updated successfully" });
};

// update user -> post /api/users/update/
exports.updateUser = async (req, res) => {
  let error;
  try {
    // update email and status
    const { user } = req.body;
    console.log(user);
    let query = "UPDATE accounts SET email = ?, accountStatus = ? WHERE username = ?";
    let params = [user.email, user.accountStatus, user.username];
    try {
      await executeQuery(query, params);
    } catch (error) {
      res.status(500).json({ error: "Failed to update email and status" });
    }

    // check password criteria
    const alphabetRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[^a-zA-Z0-9]/;
    const password = user.password;
    if (!(alphabetRegex.test(password) && numberRegex.test(password) && specialCharRegex.test(password) && password.length >= 8) && password.length <= 10) {
      return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
    }

    // bcrypt to hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password in database
    query = "UPDATE accounts SET password = ? WHERE username = ?";
    params = [hashedPassword, user.username];
    try {
      await executeQuery(query, params);
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }

    // update groups
    if (user.user_group) {
      query = "SELECT user_group FROM usergroup WHERE username = ?";
      params = [user.username];
      let groups = await executeQuery(query, params);
      const existingGroups = groups.map(group => group.user_group);
      const newGroups = user.groups.filter(group => !existingGroups.includes(group));
      const groupsToDelete = existingGroups.filter(group => !user.groups.includes(group));
      await Promise.all(newGroups.map(group => executeQuery("INSERT INTO usergroup (username, user_group) VALUES (?, ?)", [user.username, group])));
      await Promise.all(groupsToDelete.map(group => executeQuery("DELETE FROM usergroup WHERE username = ? AND user_group = ?", [user.username, group])));
    }
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// get all groups -> get /api/groups/
exports.getAllGroups = async (req, res) => {
  let query = "SELECT DISTINCT user_group FROM usergroup";
  try {
    const results = await executeQuery(query);
    res.json(results.map(group => group.user_group));
  } catch (error) {
    res.status(500).json({ error: "Failed to get groups" });
  }
};

// add group -> post /api/groups/
exports.addGroup = async (req, res) => {
  const { user_group } = req.body;
  var query = "INSERT INTO usergroup (user_group) VALUES (?)";
  var params = [user_group];
  try {
    await executeQuery(query, params);
    res.json({ success: true, message: "Group added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add group" });
  }
};

exports.getUser = async (req, res) => {
  const { username } = req.body;
  console.log(username);
  try {
    const user = await getUserByUname(username);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};

// query to get user by username
async function getUserByUname(username) {
  const query = "SELECT * FROM accounts WHERE username = ?";
  const params = [username];
  try {
    const results = await executeQuery(query, params);
    if (results.length < 1) {
      return null;
    } else {
      return results[0];
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
