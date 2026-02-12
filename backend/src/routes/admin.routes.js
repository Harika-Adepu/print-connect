const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");

// 🔐 admin-only
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboard
);

module.exports = router;
