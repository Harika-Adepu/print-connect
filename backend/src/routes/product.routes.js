const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const productController = require("../controllers/product.controller");

router.get("/", protect, authorizeRoles("customer", "owner", "admin"), productController.getProducts);
router.post("/", protect, authorizeRoles("owner", "admin"), productController.createProduct);

module.exports = router;
