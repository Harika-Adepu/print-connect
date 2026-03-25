// exports.getDashboard = async (req, res) => {
//   res.status(200).json({
//     message: "Welcome Admin",
//     user: req.user
//   });
// };


// src/controllers/admin.controller.js
const User         = require("../models/User.model");
const Order        = require("../models/Order.model");
const Product      = require("../models/Product.model");
const Template     = require("../models/Template.model");
const Payment      = require("../models/Payment.model");
const AdminRequest = require("../models/AdminRequest.model");
const { ORDER_STATUS } = require("../constants/orderStatus");

// ─── Dashboard stats ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Full system overview for admin dashboard
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalTemplates,
      completedOrders,
      pendingRequests,
      payments,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Template.countDocuments({ isActive: true }),
      Order.countDocuments({ status: ORDER_STATUS.ORDER_COMPLETED }),
      AdminRequest.countDocuments({ status: "PENDING" }),
      Payment.find({ status: "COMPLETED" }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalTemplates,
      completedOrders,
      pendingRequests,
      totalRevenue,
      usersByRole,
      ordersByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * All users with optional role filter
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders
 * All orders with full population
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("product",  "name price category")
      .populate("template", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/products
 * All products including inactive
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/products/:productId
 * Update any product field (name, price, category, description, isActive)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, description, category, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { name, price, description, category, isActive },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/products/:productId
 * Soft delete — set isActive: false
 */
exports.deactivateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deactivated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Templates ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/templates
 * All templates across all products
 */
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/templates/:templateId
 * Update template (name, isActive)
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, isActive } = req.body;

    const template = await Template.findByIdAndUpdate(
      templateId,
      { name, isActive },
      { new: true }
    ).populate("product", "name");

    if (!template) return res.status(404).json({ message: "Template not found" });
    res.status(200).json({ message: "Template updated", template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin requests (owner → admin) ──────────────────────────────────────────

/**
 * GET /api/admin/requests
 * All owner→admin requests
 */
exports.getAdminRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const requests = await AdminRequest.find(filter)
      .populate("owner",      "name email")
      .populate("product",    "name price")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/requests/:requestId/review
 * Admin approves/rejects an owner request
 * Body: { status: "APPROVED"|"REJECTED"|"REVIEWED", adminNote }
 */
exports.reviewRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ["APPROVED", "REJECTED", "REVIEWED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const request = await AdminRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status     = status;
    request.adminNote  = adminNote || undefined;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();

    // Auto-apply price update when approved
    if (status === "APPROVED" &&
        request.type === "PRICE_UPDATE" &&
        request.product &&
        request.requestedPrice) {
      await Product.findByIdAndUpdate(request.product, {
        price: request.requestedPrice,
      });
    }

    await request.save();
    await request.populate([
      { path: "owner",      select: "name email" },
      { path: "product",    select: "name price" },
      { path: "reviewedBy", select: "name" },
    ]);

    res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/payments
 * All payment records
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("order", "price status")
      .populate("user",  "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};