const mongoose = require('mongoose');
const { Schema } = mongoose;

const hostReviewSchema = new Schema({
    body: {
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    wouldRecommend: {
        type: Boolean,
        default: true
    },
    cleanliness: {
        type: Number,
        min: 1,
        max: 5
    },
    communication: {
        type: Number,
        min: 1,
        max: 5
    },
    accuracy: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for average of detailed ratings
hostReviewSchema.virtual('detailedRatingAverage').get(function() {
    const ratings = [];
    if (this.cleanliness) ratings.push(this.cleanliness);
    if (this.communication) ratings.push(this.communication);
    if (this.accuracy) ratings.push(this.accuracy);
    
    if (ratings.length === 0) return this.rating;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
});

module.exports = mongoose.model('HostReview', hostReviewSchema);
