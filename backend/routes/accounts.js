const express = require("express");
const { getUsername, isInGroup, getStatus, logoutUser, updateProfile, addUser, isAdmin, loginUser, updateUser, getAllGroups, addGroup, getUsersWithGroups, getUser } = require("../controllers/accountsController");
const { isAuthorized, allowedGroups } = require("../middlewares/auth");

const router = express.Router();

// unprotected routes
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

// protected routes
// single user
router.route("/user/is-admin").get(isAuthorized(), isAdmin);
router.route("/user/is-in-group").post(isAuthorized(), isInGroup);
router.route("/user").get(isAuthorized(), getUser);
router.route("/user").post(isAuthorized(), updateProfile);
router.route("/user/status").get(isAuthorized(), getStatus);
router.route("/user/username").get(isAuthorized(), getUsername);

// user management
router.route("/users").get(isAuthorized(), allowedGroups("admin"), getUsersWithGroups);
router.route("/users").post(isAuthorized(), allowedGroups("admin"), addUser);
router.route("/users/update").post(isAuthorized(), allowedGroups("admin"), updateUser);

// group management
router.route("/groups").get(isAuthorized(), getAllGroups);
router.route("/groups").post(isAuthorized(), allowedGroups("admin"), addGroup);

module.exports = router;
