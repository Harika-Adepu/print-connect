// src/routes/delivery.routes.js
const express = require("express");
const router  = express.Router();

const { protect }         = require("../middlewares/auth.middleware");
const { authorizeRoles }  = require("../middlewares/role.middleware");
const deliveryController  = require("../controllers/delivery.controller");

// All routes require delivery role
const deliveryOnly = [protect, authorizeRoles("delivery")];

// GET  /api/delivery/my-deliveries  → agent's assigned deliveries
router.get("/my-deliveries", ...deliveryOnly, deliveryController.getMyDeliveries);

// GET  /api/delivery/available      → orders available to pick up
router.get("/available", ...deliveryOnly, deliveryController.getAvailableOrders);

// GET  /api/delivery/stats          → agent stats
router.get("/stats", ...deliveryOnly, deliveryController.getStats);

// POST /api/delivery/accept/:orderId → self-assign an order
router.post("/accept/:orderId", ...deliveryOnly, deliveryController.acceptDelivery);

// PUT  /api/delivery/:deliveryId/pickup  → confirm pickup
router.put("/:deliveryId/pickup", ...deliveryOnly, deliveryController.confirmPickup);

// PUT  /api/delivery/:deliveryId/deliver → mark delivered
router.put("/:deliveryId/deliver", ...deliveryOnly, deliveryController.markDelivered);

module.exports = router;