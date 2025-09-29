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
        required: false, // Made optional
        minlength: 2,
        maxlength: 50,
        default: "Anonymous" // Default value
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Review", reviewSchema);