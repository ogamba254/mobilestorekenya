const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null }, // Optional for sales
    category: { 
        type: String, 
        required: true,
        enum: ['Smartphone', 'Smart TV', 'Laptop', 'Accessories', 'Other']
    },
    img: { type: String, required: true },
    // We store details as an array for easier bullet points
    details: [String], 
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);