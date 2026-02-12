const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const { authorizeRoles } = require("../middlewares/role.middleware");

// Customer routes
router.post("/", protect, authorizeRoles("customer"), orderController.createOrder);
router.get("/my-orders", protect, authorizeRoles("customer"), orderController.getMyOrders);

// Owner/Admin routes
router.get("/", protect, authorizeRoles("owner", "admin"), orderController.getAllOrders);
router.put("/:orderId/status", protect, authorizeRoles("owner"), orderController.updateOrderStatus);


module.exports = router;
