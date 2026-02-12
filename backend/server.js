require("dns").setDefaultResultOrder("ipv4first");
require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Connect DB FIRST
connectDB();

const adminRoutes = require("./src/routes/admin.routes");

app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
