const { executeQuery } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST api/login
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // cookie options
    const options = {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      samesite: "None"
    };

    // find user by username
    const user = await getUserByUname(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Bcrypt to check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign({ username, ipAddress: req.socket.remoteAddress, userAgent: req.headers["user-agent"] }, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRY
    });

    // send token with cookie
    res.status(200).cookie("token", token, options).json({
      success: "Logged in successfully",
      token
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};

exports.logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: "Logged out successfully" });
};

// GET api/is-admin
exports.isAdmin = async (req, res) => {
  try {
    const token = req.cookies.token;
    const { username } = await decodeToken(token);
    const userIsAdmin = await checkGroup(username, "admin");
    res.json({ isAdmin: userIsAdmin });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};

// GET api/user
exports.getUser = async (req, res) => {
  try {
    let decoded = await decodeToken(req.cookies.token); // get username from token
    const user = await getUserByUname(decoded.username);

    // get user's groups
    const query = "SELECT user_group FROM usergroup WHERE username = ?";
    const params = [decoded.username];
    const groups = await executeQuery(query, params);
    user.groups = groups.map(({ user_group }) => user_group);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    let decoded = await decodeToken(req.cookies.token); // get username from token
    const { accountStatus } = await getUserByUname(decoded.username);
    res.status(200).json({ accountStatus });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};

// POST api/user
exports.updateProfile = async (req, res) => {
  const { user } = req.body;

  // get user's old data
  const oldUser = await getUserByUname(user.username);

  // start transaction
  await executeQuery("START TRANSACTION");
  let needRollback = false;
  try {
    // compare old and new email
    if (user.email && !(oldUser.email === user.email)) {
      // check email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(user.email)) {
        needRollback = true;
        return res.status(400).json({ error: "Email is not valid" });
      }
      let query = "UPDATE accounts SET email = ? WHERE username = ?";
      let params = [user.email, user.username];
      await executeQuery(query, params);
    }

    // compare old and new password
    if (!(oldUser.password === user.password)) {
      // check password criteria
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^\da-zA-Z]).{8,10}$/;
      if (!passwordRegex.test(user.password)) {
        needRollback = true;
        return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
      }
      let hashedPassword = await bcrypt.hash(user.password, 10);
      let query = "UPDATE accounts SET password = ? WHERE username = ?";
      let params = [hashedPassword, user.username];
      await executeQuery(query, params);
    }
  } catch (error) {
    needRollback = true;
    console.log(error);
    return res.status(500).json({ error: "Failed to update user" });
  } finally {
    if (needRollback) {
      await executeQuery("ROLLBACK");
    } else {
      await executeQuery("COMMIT");
      return res.status(200).json({ success: "Profile updated successfully" });
    }
  }
};

// POST /api/users/update
exports.updateUser = async (req, res) => {
  const { user } = req.body;

  // get user's old data
  const oldUser = await getUserByUname(user.username);

  // start transaction
  await executeQuery("START TRANSACTION");

  // compare old and new email
  if (!(oldUser.email === user.email)) {
    // check email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(user.email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }
    let query = "UPDATE accounts SET email = ? WHERE username = ?";
    let params = [user.email, user.username];
    try {
      await executeQuery(query, params);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  // compare old and new accountStatus
  if (!(oldUser.accountStatus === user.accountStatus)) {
    let query = "UPDATE accounts SET accountStatus = ? WHERE username = ?";
    let params = [user.accountStatus, user.username];
    try {
      await executeQuery(query, params);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  // compare old and new password
  if (!(oldUser.password === user.password)) {
    // check password criteria
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^\da-zA-Z]).{8,10}$/;
    if (!passwordRegex.test(user.password)) {
      return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
    }
    let hashedPassword = await bcrypt.hash(user.password, 10);
    let query = "UPDATE accounts SET password = ? WHERE username = ?";
    let params = [hashedPassword, user.username];
    try {
      await executeQuery(query, params);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  // update groups
  if (user.groups) {
    const existingGroups = (await executeQuery("SELECT user_group FROM usergroup WHERE username = ?", [user.username])).map(group => group.user_group);
    const groupsToAdd = user.groups.filter(group => !existingGroups.includes(group));
    const groupsToRemove = existingGroups.filter(group => !user.groups.includes(group));
    try {
      await Promise.all(groupsToAdd.map(group => executeQuery("INSERT INTO usergroup (username, user_group) VALUES (?, ?)", [user.username, group])));
      await Promise.all(groupsToRemove.map(group => executeQuery("DELETE FROM usergroup WHERE username = ? AND user_group = ?", [user.username, group])));
      await executeQuery("COMMIT");
      res.json({ success: "Details updated successfully" });
    } catch (error) {
      await executeQuery("ROLLBACK");
      return res.status(500).json({ error: "Failed to update user" });
    }
  } else {
    try {
      await executeQuery("DELETE FROM usergroup WHERE username = ?", [user.username]);
      await executeQuery("COMMIT");
      res.json({ success: "Details updated successfully" });
    } catch (error) {
      await executeQuery("ROLLBACK");
      return res.status(500).json({ error: "Failed to update user" });
    }
  }
};

// GET /api/users/groups
exports.getUsersWithGroups = async (req, res) => {
  let getUsersQuery = "SELECT * FROM accounts";
  let getUserGroupsQuery = "SELECT * FROM usergroup";

  try {
    let users = await executeQuery(getUsersQuery);
    let groups = await executeQuery(getUserGroupsQuery);

    users.forEach(user => {
      user.groups = groups.filter(group => group.username === user.username).map(group => group.user_group);
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
};

// POST api/users
exports.addUser = async (req, res) => {
  const { user } = req.body;

  // check if username exists
  const existingUser = await getUserByUname(user.username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // check email format
  if (user.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(user.email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }
  }

  // check password criteria
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^\da-zA-Z]).{8,10}$/;
  if (!passwordRegex.test(user.password)) {
    return res.status(400).json({ error: "Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least one letter, one number, and one special character" });
  }

  // bcrypt to hash password
  const hashedPassword = await bcrypt.hash(user.password, 10);

  try {
    await executeQuery("START TRANSACTION");

    // add user to database
    var query = "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)";
    var params = [user.username, hashedPassword, user.email, user.accountStatus];
    await executeQuery(query, params);

    // add user groups to user_group table
    if (user.user_group) {
      for (const group of user.user_group) {
        query = "INSERT INTO usergroup (username, user_group) VALUES (?, ?)";
        params = [user.username, group];
        await executeQuery(query, params);
      }
    }

    await executeQuery("COMMIT");
    res.json({ success: "User added successfully" });
  } catch (error) {
    await executeQuery("ROLLBACK");
    res.status(500).json({ error: "Failed to add user" });
  }
};

// Get api/groups
exports.getAllGroups = async (req, res) => {
  const query = "SELECT DISTINCT user_group FROM usergroup";
  try {
    const groups = await executeQuery(query);
    res.json(groups.map(({ user_group }) => user_group)); // return only user_group column as array
  } catch (error) {
    res.status(500).json({ error: "Failed to get groups" });
  }
};

// POST /api/groups
exports.addGroup = async (req, res) => {
  const { newGroup } = req.body;
  var query = "INSERT INTO usergroup (user_group) VALUES (?)";
  var params = [newGroup];
  try {
    await executeQuery(query, params);
    res.json({ success: "Group added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add group" });
  }
};

exports.getUsername = async (req, res) => {
  try {
    const username = await getUNameFromToken(req.cookies.token);
    res.json({ username });
  } catch (error) {
    res.status(500).json({ error: "Failed to get username" });
  }
};

exports.isInGroup = async (req, res) => {
  const { group } = req.body;
  const username = await getUNameFromToken(req.cookies.token);
  const query = `SELECT * FROM usergroup WHERE username = ? AND user_group = ?`;
  const params = [username, group];
  try {
    const results = await executeQuery(query, params);
    res.json({ isInGroup: results.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to check if user is in group" });
  }
};

/*------------------------------------------------------------------------------------*/
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

// function to decode token
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

// check if user is in group
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
