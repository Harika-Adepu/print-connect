// src/controllers/delivery.controller.js
const Delivery = require("../models/Delivery.model");
const Order = require("../models/Order.model");
const { ORDER_STATUS } = require("../constants/orderStatus");

/**
 * GET /api/delivery/my-deliveries
 * Delivery agent sees all deliveries assigned to them
 */
exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryAgent: req.user.id })
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name email phone" },
          { path: "product",  select: "name price category" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/delivery/available
 * Delivery agent sees all orders that are OUT_FOR_DELIVERY
 * (not yet assigned to any agent — available to pick up)
 */
exports.getAvailableOrders = async (req, res) => {
  try {
    // Find orders that are out for delivery
    const outForDeliveryOrders = await Order.find({
      status: ORDER_STATUS.OUT_FOR_DELIVERY,
    })
      .populate("customer", "name email phone")
      .populate("product",  "name price category")
      .sort({ createdAt: -1 });

    // Find which ones are already assigned
    const assignedOrderIds = await Delivery.find({
      status: { $in: ["assigned", "picked"] },
    }).distinct("order");

    // Filter out already assigned
    const available = outForDeliveryOrders.filter(
      (o) => !assignedOrderIds.map(String).includes(String(o._id))
    );

    res.status(200).json(available);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/delivery/accept/:orderId
 * Delivery agent accepts/self-assigns an order
 */
exports.acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== ORDER_STATUS.OUT_FOR_DELIVERY) {
      return res.status(400).json({
        message: "Order is not available for delivery",
      });
    }

    // Check if already assigned
    const existing = await Delivery.findOne({
      order: orderId,
      status: { $in: ["assigned", "picked"] },
    });
    if (existing) {
      return res.status(400).json({ message: "Order already assigned to a delivery agent" });
    }

    const delivery = await Delivery.create({
      order:         orderId,
      deliveryAgent: req.user.id,
      status:        "assigned",
    });

    await delivery.populate({
      path: "order",
      populate: [
        { path: "customer", select: "name email phone" },
        { path: "product",  select: "name price category" },
      ],
    });

    res.status(201).json({
      message: "Delivery accepted successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/delivery/:deliveryId/pickup
 * Delivery agent confirms they have picked up the order
 * Delivery status: assigned → picked
 */
exports.confirmPickup = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Only the assigned agent can update
    if (delivery.deliveryAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your delivery" });
    }

    if (delivery.status !== "assigned") {
      return res.status(400).json({ message: "Order not in assigned state" });
    }

    delivery.status    = "picked";
    delivery.pickupTime = new Date();
    await delivery.save();

    res.status(200).json({
      message: "Pickup confirmed",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/delivery/:deliveryId/deliver
 * Delivery agent marks order as delivered
 * Delivery status: picked → delivered
 * Order status: OUT_FOR_DELIVERY → DELIVERED
 */
exports.markDelivered = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId).populate("order");
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.deliveryAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your delivery" });
    }

    if (delivery.status !== "picked") {
      return res.status(400).json({
        message: "Must confirm pickup before marking delivered",
      });
    }

    // Update delivery record
    delivery.status       = "delivered";
    delivery.deliveryTime = new Date();
    await delivery.save();

    // Update order status → DELIVERED
    await Order.findByIdAndUpdate(delivery.order._id, {
      status: ORDER_STATUS.DELIVERED,
    });

    res.status(200).json({
      message: "Order marked as delivered successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/delivery/stats
 * Delivery agent stats — total, picked, delivered
 */
exports.getStats = async (req, res) => {
  try {
    const all       = await Delivery.countDocuments({ deliveryAgent: req.user.id });
    const assigned  = await Delivery.countDocuments({ deliveryAgent: req.user.id, status: "assigned" });
    const picked    = await Delivery.countDocuments({ deliveryAgent: req.user.id, status: "picked" });
    const delivered = await Delivery.countDocuments({ deliveryAgent: req.user.id, status: "delivered" });

    res.status(200).json({ total: all, assigned, picked, delivered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};