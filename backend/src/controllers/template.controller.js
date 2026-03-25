// const Template = require("../models/Template.model");

// // GET /api/templates?productId=xxx
// exports.getTemplatesByProduct = async (req, res) => {
//   try {
//     const { productId } = req.query;

//     if (!productId) {
//       return res.status(400).json({ message: "productId query param required" });
//     }

//     const templates = await Template.find({ product: productId, isActive: true });
//     res.status(200).json(templates);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // POST /api/templates
// exports.createTemplate = async (req, res) => {
//   try {
//     const { name, product, previewImage } = req.body;

//     if (!name || !product) {
//       return res.status(400).json({ message: "Name and product are required" });
//     }

//     const template = new Template({ name, product, previewImage });
//     await template.save();

//     res.status(201).json({ message: "Template created successfully", template });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// src/controllers/template.controller.js

const Template = require("../models/Template.model");

/**
 * GET /api/templates?productId=xxx
 * Returns active templates for a product
 * Accessible by: customer, owner, admin
 */
exports.getTemplatesByProduct = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ message: "productId query param is required" });
    }

    const templates = await Template.find({
      product: productId,
      isActive: true,
    }).sort({ createdAt: -1 });

    // Always return array — never 404 for empty
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/templates
 * Creates a new template for a product
 * Accessible by: owner, admin
 */
exports.createTemplate = async (req, res) => {
  try {
    const { name, product, previewImage } = req.body;

    if (!name || !product) {
      return res.status(400).json({ message: "Name and product are required" });
    }

    const template = await Template.create({
      name:         name.trim(),
      product,
      previewImage: previewImage || undefined,
      isActive:     true,
    });

    res.status(201).json({ message: "Template created successfully", template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/templates/:templateId
 * Updates a template
 * Accessible by: owner, admin
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