const express = require("express");
const { addUser, loginUser, updateUser, getAllGroups, getUsers, addGroup, getUsersWithGroups, getUser } = require("../controllers/accountsController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

router.route("/login").post(loginUser);

// protected routes
router.route("/users").post(addUser).get(getUsers);
router.route("/groups").post(addGroup).get(getAllGroups);
router.route("/users/groups").get(getUsersWithGroups);
router.route("/users/update").post(updateUser);
router.route("/user").post(getUser);

module.exports = router;
