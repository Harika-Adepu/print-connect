const Product = require("../models/Product.model");

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    // Customers can see only active products
    const products = await Product.find({ isActive: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = new Product({
      name,
      price,
      description,
      category,
    });

    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
