const jwt = require("jsonwebtoken");
const { executeQuery } = require("../db");

// is user Authorized
exports.isAuthorizedUser = (...roles) => {
  return async (req, res, next) => {
    try {
      // check if user is authenticated with token
      const decoded = await decodeToken(req.cookies.token);
      req.user = await getUserByUname(decoded.username);

      // check if user exists
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // check if user is active
      if (!req.user.accountStatus) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      //use checkGroup function to check for role
      const hasRole = roles.some(role => checkGroup(req.user.username, role));
      if (hasRole) {
        return next();
      }

      res.status(403).json({ error: "Unauthorized" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unauthorized" });
    }
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
  if (results.length < 1) {
    return false;
  }
  return true;
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
