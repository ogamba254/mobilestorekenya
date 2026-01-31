const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    // Link the cart to a User ID from your Users collection
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // Each user should only have one active cart
    },
    // Array of products currently in the cart
    products: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product',
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true, 
                default: 1,
                min: 1 
            }
        }
    ],
    // Automatically track when the cart was last updated
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Cart', cartSchema);