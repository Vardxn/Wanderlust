const Joi = require('joi');

/**
 * Validation schema for listing creation/update
 */
module.exports.listingSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 100 characters'
        }),
    
    description: Joi.string()
        .required()
        .min(20)
        .max(2000)
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 20 characters long',
            'string.max': 'Description cannot exceed 2000 characters'
        }),
    
    location: Joi.string()
        .required()
        .messages({
            'string.empty': 'Location is required'
        }),
    
    country: Joi.string()
        .required()
        .messages({
            'string.empty': 'Country is required'
        }),
    
    price: Joi.number()
        .required()
        .min(0)
        .messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative'
        }),
    
    image: Joi.object({
        url: Joi.string().required(),
        filename: Joi.string().allow('')
    }).required(),
    
    propertyType: Joi.string()
        .required()
        .valid('House', 'Apartment', 'Villa', 'Cottage', 'Cabin', 'Hotel', 'Hostel', 'Other')
        .messages({
            'string.empty': 'Property type is required',
            'any.only': 'Invalid property type'
        }),
    
    maxGuests: Joi.number()
        .required()
        .min(1)
        .max(50)
        .messages({
            'number.min': 'Must accommodate at least 1 guest',
            'number.max': 'Maximum 50 guests allowed'
        }),
    
    bedrooms: Joi.number()
        .required()
        .min(0)
        .max(20)
        .messages({
            'number.min': 'Bedrooms cannot be negative',
            'number.max': 'Maximum 20 bedrooms allowed'
        }),
    
    bathrooms: Joi.number()
        .required()
        .min(0)
        .max(20)
        .messages({
            'number.min': 'Bathrooms cannot be negative',
            'number.max': 'Maximum 20 bathrooms allowed'
        }),
    
    amenities: Joi.array()
        .items(Joi.string())
        .default([]),
    
    minimumStay: Joi.number()
        .min(1)
        .max(365)
        .default(1),
    
    maximumStay: Joi.number()
        .min(1)
        .max(365)
        .default(365),
    
    cleaningFee: Joi.number()
        .min(0)
        .default(0),
    
    weeklyDiscount: Joi.number()
        .min(0)
        .max(100)
        .default(0),
    
    monthlyDiscount: Joi.number()
        .min(0)
        .max(100)
        .default(0),
    
    instantBook: Joi.boolean()
        .default(false)
}).required();

/**
 * Validation schema for review creation
 */
module.exports.reviewSchema = Joi.object({
    rating: Joi.number()
        .required()
        .min(1)
        .max(5)
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
    
    comment: Joi.string()
        .required()
        .min(10)
        .max(500)
        .messages({
            'string.empty': 'Comment is required',
            'string.min': 'Comment must be at least 10 characters long',
            'string.max': 'Comment cannot exceed 500 characters'
        })
}).required();

/**
 * Validation schema for booking creation
 */
module.exports.bookingSchema = Joi.object({
    checkIn: Joi.date()
        .required()
        .greater('now')
        .messages({
            'date.base': 'Check-in date must be a valid date',
            'date.greater': 'Check-in date must be in the future',
            'any.required': 'Check-in date is required'
        }),
    
    checkOut: Joi.date()
        .required()
        .greater(Joi.ref('checkIn'))
        .messages({
            'date.base': 'Check-out date must be a valid date',
            'date.greater': 'Check-out must be after check-in',
            'any.required': 'Check-out date is required'
        }),
    
    adults: Joi.number()
        .required()
        .min(1)
        .max(16)
        .messages({
            'number.min': 'At least 1 adult required',
            'number.max': 'Maximum 16 adults allowed'
        }),
    
    children: Joi.number()
        .min(0)
        .max(10)
        .default(0),
    
    infants: Joi.number()
        .min(0)
        .max(5)
        .default(0),
    
    pets: Joi.number()
        .min(0)
        .max(5)
        .default(0),
    
    specialRequests: Joi.string()
        .allow('')
        .max(500)
}).required();

/**
 * Validation schema for user registration
 */
module.exports.userSchema = Joi.object({
    username: Joi.string()
        .required()
        .alphanum()
        .min(3)
        .max(30)
        .messages({
            'string.alphanum': 'Username must contain only letters and numbers',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters'
        }),
    
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),
    
    password: Joi.string()
        .required()
        .min(6)
        .messages({
            'string.min': 'Password must be at least 6 characters long'
        }),
    
    firstName: Joi.string()
        .required()
        .min(2)
        .max(50),
    
    lastName: Joi.string()
        .required()
        .min(2)
        .max(50)
}).required();
