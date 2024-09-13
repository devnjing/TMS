const express = require("express");
const { addUser, isAdmin, loginUser, updateUser, getAllGroups, getUsers, addGroup, getUsersWithGroups, getUser } = require("../controllers/accountsController");
const { isAuthorizedUser } = require("../middlewares/auth");

const router = express.Router();

router.route("/login").post(loginUser);

// protected routes
router.route("/user/is-admin").get(isAuthorizedUser("admin", "user"), isAdmin);
router.route("/user").get(isAuthorizedUser("admin", "user"), getUser);
router.route("/user").post(isAuthorizedUser("admin", "user"), updateUser);
router.route("/users").post(addUser).get(getUsers);
router.route("/groups").post(addGroup).get(getAllGroups);
router.route("/users/groups").get(getUsersWithGroups);

module.exports = router;
