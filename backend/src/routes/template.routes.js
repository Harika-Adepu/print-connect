const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const templateController = require("../controllers/template.controller");

router.get("/", protect, authorizeRoles("customer", "owner", "admin"), templateController.getTemplatesByProduct);
router.post("/", protect, authorizeRoles("owner", "admin"), templateController.createTemplate);

module.exports = router;
