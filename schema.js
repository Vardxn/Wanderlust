const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(1000),
    image: Joi.string().allow("", null),
    price: Joi.number().required().min(0),
    location: Joi.string().required().min(2).max(100),
    country: Joi.string().required().min(2).max(100)
});

module.exports.reviewSchema = Joi.object({
    comment: Joi.string().required().min(10).max(500),
    rating: Joi.number().required().min(1).max(5),
    author: Joi.string().optional().min(2).max(50).default("Anonymous") // Made optional with default
});