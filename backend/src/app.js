const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require("./routes/product.routes");
const templateRoutes = require("./routes/template.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRequestRoutes = require("./routes/adminRequest.routes"); // ← NEW

const deliveryRoutes = require("./routes/delivery.routes");
// const adminRoutes = require("./routes/admin.routes");
// const webhookRoutes = require("./routes/webhook.routes");


const paymentController = require("./controllers/payment.controller");

const app = express();

// Enable CORS
app.use(cors());

// Razorpay webhook endpoint - needs raw body parsing
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleRazorpayWebhook
);

// Now normal JSON parsing
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('PrintConnect Backend is Running 🚀');
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "PrintConnect API" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin-requests", adminRequestRoutes);

app.use("/api/delivery", deliveryRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/webhook", webhookRoutes);

module.exports = app;
