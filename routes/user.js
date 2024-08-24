const express = require("express");
const {
  login,
  logout,
  getUserComplains,
  getMyComplains,
  resetPassword,
  addUser,
  removeUser,
  testUser,
  getAllUsers,
} = require("../Controllers/user");

const { isAuthenticated } = require("../middlewares/isAuthenticated");

const router = express.Router();

// router.route("/login").get(getAllhUsers);
router.route("/login").get(login);
router.route("/logout").get(logout);
router.route("/my/complains").get(isAuthenticated, getMyComplains);
router.route("/usercomplaints/:id").get(isAuthenticated, getUserComplains);
router.route("/password/reset/:token").put(resetPassword);
router.route("/register").post(addUser).delete(removeUser).get(testUser);

module.exports = router;
