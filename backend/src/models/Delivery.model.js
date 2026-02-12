const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['assigned','picked','delivered'], default: 'assigned' },
    pickupTime: { type: Date },
    deliveryTime: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', DeliverySchema);
