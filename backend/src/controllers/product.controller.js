// const Product = require("../models/Product.model");

// // GET /api/products
// exports.getProducts = async (req, res) => {
//   try {
//     // Customers can see only active products
//     const products = await Product.find({ isActive: true });
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // POST /api/products
// exports.createProduct = async (req, res) => {
//   try {
//     const { name, price, description, category } = req.body;

//     if (!name || !price) {
//       return res.status(400).json({ message: "Name and price are required" });
//     }

//     const product = new Product({
//       name,
//       price,
//       description,
//       category,
//     });

//     await product.save();

//     res.status(201).json({ message: "Product created successfully", product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// src/controllers/product.controller.js

const Product = require("../models/Product.model");

/**
 * GET /api/products
 * Returns all ACTIVE products
 * Accessible by: customer, owner, admin
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

    // Always return array — never 404 for empty list
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/products
 * Creates a new product
 * Accessible by: owner, admin
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const product = await Product.create({
      name:        name.trim(),
      price:       parseFloat(price),
      description: description?.trim() || undefined,
      category:    category?.trim()    || undefined,
      isActive:    true,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/products/:productId
 * Updates a product
 * Accessible by: owner, admin
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