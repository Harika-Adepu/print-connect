// src/routes/adminRequest.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const adminRequestController = require("../controllers/adminRequest.controller");

// Owner routes
router.post(
  "/",
  protect,
  authorizeRoles("owner"),
  adminRequestController.createRequest
);

router.get(
  "/my-requests",
  protect,
  authorizeRoles("owner"),
  adminRequestController.getMyRequests
);

// Admin routes
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  adminRequestController.getAllRequests
);

router.get(
  "/pending-count",
  protect,
  authorizeRoles("admin"),
  adminRequestController.getPendingCount
);

router.put(
  "/:requestId/review",
  protect,
  authorizeRoles("admin"),
  adminRequestController.reviewRequest
);

module.exports = router;