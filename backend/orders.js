const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        priceAtPurchase: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, 
    paymentMethod: { type: String, default: 'M-Pesa' },
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);