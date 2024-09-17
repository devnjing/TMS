const jwt = require("jsonwebtoken");
const { executeQuery } = require("../db");

// is user Authorized
exports.isAuthorizedUser = (...groups) => {
  return async (req, res, next) => {
    const token = req.cookies.token;
    try {
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // decode token and find user
      const decoded = await decodeToken(req.cookies.token);
      req.user = await getUserByUsername(decoded.username);
      if (!req.user) {
        res.clearCookie("token");
        return res.status(401).json({ error: "Unauthorized" });
      }

      //verify ip
      const ip = decoded.ipAddress;
      const requestIp = req.header["x-forwarded-for"] || req.connection.remoteAddress;
      if (ip !== requestIp) {
        res.clearCookie("token");
        return res.status(401).json({ error: "Unauthorized" });
      }

      //verify browser
      const browser = decoded.userAgent;
      const requestBrowser = req.headers["user-agent"];
      if (browser !== requestBrowser) {
        res.clearCookie("token");
        return res.status(401).json({ error: "Unauthorized" });
      }

      // check if user is active
      if (req.user.accountStatus === "disabled") {
        res.clearCookie("token");
        return res.status(401).json({ error: "Unauthorized" });
      }

      //use checkGroup function to check for group
      let hasGroup = false;
      for (const group of groups) {
        if ((await checkGroup(req.user.username, group)) === true) {
          hasGroup = true;
          break;
        }
      }
      if (hasGroup) {
        next();
      } else {
        res.clearCookie("token");
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (error) {
      console.error(error);
      res.clearCookie("token");
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};

/*------------------------------------------------------------functions-------------------------------------------------------------------------------------------------*/
async function getUserByUsername(username) {
  const query = "SELECT * FROM accounts WHERE username = ?";
  const params = [username];

  try {
    const results = await executeQuery(query, params);

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function checkGroup(username, groupname) {
  const query = "SELECT * FROM usergroup WHERE username = ? AND user_group = ?";
  const params = [username, groupname];
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
