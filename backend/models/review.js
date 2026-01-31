const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Link to the Product being reviewed
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    // Link to the User who wrote the review
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: [true, "Please add a comment about the phone"],
        trim: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// This prevents a user from leaving multiple reviews for the same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);