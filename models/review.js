const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    author: {
        type: String,
        default: 'Anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;