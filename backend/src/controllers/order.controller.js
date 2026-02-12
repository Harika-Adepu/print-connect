const Order = require("../models/Order.model");
const { ORDER_STATUS } = require("../constants/orderStatus");
const Product = require("../models/Product.model");

/**
 * CREATE ORDER (Customer)
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      product,
      template,
      quantity,
      language,
      color,
      pictures,
      timeRequired,
      details
    } = req.body;

    if (!product || !quantity) {
      return res
        .status(400)
        .json({ message: "Product and quantity are required" });
    }


    
    const productDoc = await Product.findById(product);
    if (!productDoc || !productDoc.isActive) {
      return res.status(400).json({ message: "Invalid or inactive product" });
    }

    const totalPrice = productDoc.price * quantity;

    const order = await Order.create({
      customer: req.user.id,
      product,
      template,
      quantity,
      language,
      color,
      pictures,
      timeRequired,
      details,
      price: totalPrice,
      status: ORDER_STATUS.ORDER_PLACED
    });

    

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET MY ORDERS (Customer)
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("product", "name price category")
      .populate("template", "name previewImage")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL ORDERS (Owner / Admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("product", "name price category")
      .populate("template", "name previewImage")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.status;

    const allowedTransitions = {
      [ORDER_STATUS.ORDER_PLACED]: [
        ORDER_STATUS.DESIGN_APPROVED,
        ORDER_STATUS.DESIGN_REJECTED
      ],

      [ORDER_STATUS.DESIGN_APPROVED]: [
        ORDER_STATUS.ADVANCE_PAYMENT_PENDING
      ],

      [ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED]: [
        ORDER_STATUS.PRINTING_IN_PROGRESS
      ],

      [ORDER_STATUS.PRINTING_IN_PROGRESS]: [
        ORDER_STATUS.PRINTING_COMPLETED
      ],

      [ORDER_STATUS.REMAINING_PAYMENT_COMPLETED]: [
        ORDER_STATUS.OUT_FOR_DELIVERY
      ],

      [ORDER_STATUS.OUT_FOR_DELIVERY]: [
        ORDER_STATUS.DELIVERED
      ],

      [ORDER_STATUS.DELIVERED]: [
        ORDER_STATUS.ORDER_COMPLETED
      ]
    };

    if (
      allowedTransitions[currentStatus] &&
      !allowedTransitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    order.status = status;


    // 🔁 AUTO STATUS TRANSITIONS
    if (status === ORDER_STATUS.DESIGN_APPROVED) {
      order.status = ORDER_STATUS.ADVANCE_PAYMENT_PENDING;
    }

    if (status === ORDER_STATUS.PRINTING_COMPLETED) {
      order.status = ORDER_STATUS.REMAINING_PAYMENT_PENDING;
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
