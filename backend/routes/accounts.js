const express = require("express");
const { logoutUser, updateProfile, addUser, isAdmin, loginUser, updateUser, getAllGroups, addGroup, getUsersWithGroups, getUser } = require("../controllers/accountsController");
const { isAuthorizedUser } = require("../middlewares/auth");

const router = express.Router();

// unprotected routes
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

// protected routes
// single user
router.route("/user/is-admin").get(isAuthorizedUser("admin", "user"), isAdmin);
router.route("/user").get(isAuthorizedUser("admin", "user"), getUser);
router.route("/user").post(isAuthorizedUser("admin", "user"), updateProfile);

// user management
router.route("/users").get(isAuthorizedUser("admin"), getUsersWithGroups);
router.route("/users").post(isAuthorizedUser("admin"), addUser);
router.route("/users/update").post(isAuthorizedUser("admin"), updateUser);

// group management
router.route("/groups").get(isAuthorizedUser("admin"), getAllGroups);
router.route("/groups").post(isAuthorizedUser("admin"), addGroup);

module.exports = router;
