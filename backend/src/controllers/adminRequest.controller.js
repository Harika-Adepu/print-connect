// src/controllers/adminRequest.controller.js
const AdminRequest = require("../models/AdminRequest.model");
const Product = require("../models/Product.model");

/**
 * POST /api/admin-requests
 * Owner submits any type of request to admin
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      product,
      template,
      currentPrice,
      requestedPrice,
      discountPercentage,
      discountReason,
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        message: "type, title and description are required",
      });
    }

    const validTypes = [
      "PRICE_UPDATE",
      "TEMPLATE_UPDATE",
      "PRODUCT_CHANGE",
      "DISCOUNT_REQUEST",
      "OPERATIONAL_FEEDBACK",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid request type" });
    }

    // Extra validation for price update
    if (type === "PRICE_UPDATE") {
      if (!product || !requestedPrice) {
        return res.status(400).json({
          message: "product and requestedPrice are required for PRICE_UPDATE",
        });
      }
    }

    // Extra validation for discount
    if (type === "DISCOUNT_REQUEST") {
      if (!product || !discountPercentage) {
        return res.status(400).json({
          message: "product and discountPercentage are required for DISCOUNT_REQUEST",
        });
      }
    }

    const request = await AdminRequest.create({
      owner: req.user.id,
      type,
      title,
      description,
      product: product || undefined,
      template: template || undefined,
      currentPrice: currentPrice || undefined,
      requestedPrice: requestedPrice || undefined,
      discountPercentage: discountPercentage || undefined,
      discountReason: discountReason || undefined,
    });

    await request.populate("product", "name price");

    res.status(201).json({
      message: "Request submitted to admin successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin-requests/my-requests
 * Owner views their own submitted requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({ owner: req.user.id })
      .populate("product", "name price")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin-requests
 * Admin views ALL requests from all owners
 */
exports.getAllRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await AdminRequest.find(filter)
      .populate("owner", "name email")
      .populate("product", "name price")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin-requests/:requestId/review
 * Admin reviews (approves/rejects) a request
 * Body: { status, adminNote }
 */
exports.reviewRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { requestId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ["APPROVED", "REJECTED", "REVIEWED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const request = await AdminRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.adminNote = adminNote || undefined;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();

    // ─── Auto-apply price update if approved ──────────────────────────────
    if (status === "APPROVED" && request.type === "PRICE_UPDATE" && request.product) {
      await Product.findByIdAndUpdate(request.product, {
        price: request.requestedPrice,
      });
    }

    await request.save();
    await request.populate("owner", "name email");
    await request.populate("product", "name price");
    await request.populate("reviewedBy", "name");

    res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin-requests/pending-count
 * Admin gets count of pending requests (for dashboard badge)
 */
exports.getPendingCount = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const count = await AdminRequest.countDocuments({ status: "PENDING" });
    res.status(200).json({ pendingCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};