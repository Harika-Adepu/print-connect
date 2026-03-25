// scripts/seed.js
// Run this ONCE to add test products to your database
// Command: node scripts/seed.js

require("dotenv").config();

console.log("URI found:", process.env.MONGO_URI ? "YES" : "NO");
const mongoose = require("mongoose");
const Product  = require("../src/models/Product.model");
const Template = require("../src/models/Template.model");

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

const PRODUCTS = [
  {
    name:        "Visiting Card",
    price:       500,
    description: "Premium quality visiting cards with glossy finish",
    category:    "Cards",
    isActive:    true,
  },
  {
    name:        "Poster A3",
    price:       1200,
    description: "Full colour A3 poster printing",
    category:    "Posters",
    isActive:    true,
  },
  {
    name:        "Pamphlet / Flyer",
    price:       800,
    description: "Single or double sided pamphlet printing",
    category:    "Flyers",
    isActive:    true,
  },
  {
    name:        "Banner (3x6 ft)",
    price:       2500,
    description: "Flex banner printing, weather resistant",
    category:    "Banners",
    isActive:    true,
  },
  {
    name:        "Letter Head",
    price:       600,
    description: "Professional letterhead stationery",
    category:    "Stationery",
    isActive:    true,
  },
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // Clear existing products
    await Product.deleteMany({});
    await Template.deleteMany({});
    console.log("🗑️  Cleared existing products and templates");

    // Insert products
    const inserted = await Product.insertMany(PRODUCTS);
    console.log(`✅ Inserted ${inserted.length} products:`);
    inserted.forEach(p => console.log(`   • ${p.name} — ₹${p.price}`));

    // Add sample templates for Visiting Card
    const visitingCard = inserted.find(p => p.name === "Visiting Card");
    if (visitingCard) {
      await Template.insertMany([
        { name: "Classic White",    product: visitingCard._id, isActive: true },
        { name: "Dark Professional", product: visitingCard._id, isActive: true },
        { name: "Modern Minimal",   product: visitingCard._id, isActive: true },
      ]);
      console.log("✅ Added 3 templates for Visiting Card");
    }

    console.log("\n🎉 Seed complete! Products are ready in the database.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();