const express = require("express");
const { addUser, loginUser, updateUser, getAllGroups, getUsers, addGroup, getUsersWithGroups } = require("../controllers/accountsController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();
router.route("/login").post(loginUser); // authController

// protected routes
router.route("/users").post(addUser).get(getUsers);
router.route("/groups").post(addGroup).get(getAllGroups);
router.route("/users/groups").get(getUsersWithGroups);
router.route("/users/update").post(updateUser);

module.exports = router;
