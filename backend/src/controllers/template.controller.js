const Template = require("../models/Template.model");

// GET /api/templates?productId=xxx
exports.getTemplatesByProduct = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ message: "productId query param required" });
    }

    const templates = await Template.find({ product: productId, isActive: true });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/templates
exports.createTemplate = async (req, res) => {
  try {
    const { name, product, previewImage } = req.body;

    if (!name || !product) {
      return res.status(400).json({ message: "Name and product are required" });
    }

    const template = new Template({ name, product, previewImage });
    await template.save();

    res.status(201).json({ message: "Template created successfully", template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
