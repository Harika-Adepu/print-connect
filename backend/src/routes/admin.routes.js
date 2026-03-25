// const express = require("express");
// const router = express.Router();

// const { protect } = require("../middlewares/auth.middleware");
// const { authorizeRoles } = require("../middlewares/role.middleware");
// const adminController = require("../controllers/admin.controller");

// // 🔐 admin-only
// router.get(
//   "/dashboard",
//   protect,
//   authorizeRoles("admin"),
//   adminController.getDashboard
// );

// module.exports = router;


// src/routes/admin.routes.js
const express = require("express");
const router  = express.Router();

const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const adminController    = require("../controllers/admin.controller");

const adminOnly = [protect, authorizeRoles("admin")];

// ── Dashboard ──────────────────────────────────────────────────────────────────
router.get("/stats",    ...adminOnly, adminController.getStats);

// ── Users ──────────────────────────────────────────────────────────────────────
router.get("/users",              ...adminOnly, adminController.getAllUsers);
router.delete("/users/:userId",   ...adminOnly, adminController.deleteUser);

// ── Orders ─────────────────────────────────────────────────────────────────────
router.get("/orders", ...adminOnly, adminController.getAllOrders);

// ── Products ───────────────────────────────────────────────────────────────────
router.get("/products",                    ...adminOnly, adminController.getAllProducts);
router.put("/products/:productId",         ...adminOnly, adminController.updateProduct);
router.delete("/products/:productId",      ...adminOnly, adminController.deactivateProduct);

// ── Templates ──────────────────────────────────────────────────────────────────
router.get("/templates",                   ...adminOnly, adminController.getAllTemplates);
router.put("/templates/:templateId",       ...adminOnly, adminController.updateTemplate);

// ── Owner→Admin Requests ────────────────────────────────────────────────────────
router.get("/requests",                           ...adminOnly, adminController.getAdminRequests);
router.put("/requests/:requestId/review",         ...adminOnly, adminController.reviewRequest);

// ── Payments ───────────────────────────────────────────────────────────────────
router.get("/payments", ...adminOnly, adminController.getAllPayments);

module.exports = router;