const jwt = require("jsonwebtoken");
const { executeQuery } = require("../db");

// check if user is authenticated
exports.isAuthenticatedUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Please login to access this resource" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await getUserByUname(decoded.username);

  next();
};

//handling users roles
exports.authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    const user = req.user;

    // check if user is active
    if (!user.active) {
      return res.status(403).json({ error: "User is not active" });
    }

    //use checkGroup function to check for role
    for (let role of roles) {
      if (await checkGroup(user.username, role)) {
        return next();
      }
    }

    return res.status(403).json({ error: "Unauthorized role" });
  };
};

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

async function checkGroup(username, groupname) {
  let query = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
  let params = [username, groupname];
  let results;
  try {
    results = await executeQuery(query, params);
  } catch (error) {
    return error;
  }
  console.log("query results", results);
  if (results.length < 1) {
    return false;
  }
  return true;
}
