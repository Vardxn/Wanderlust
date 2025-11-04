import mongoose, { Schema, Document, Types } from 'mongoose';

interface IPhoto {
  url: string;
  caption?: string;
  isCover: boolean;
}

interface ILocation {
  address?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface ICapacity {
  accommodates: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

interface IPricing {
  pricePerNight: number; // in cents
  securityDeposit?: number; // in cents
  cleaningFee?: number; // in cents
}

interface IBookingRules {
  minimumNights: number;
  maximumNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  instantBookable: boolean;
}

interface IReviewScores {
  rating?: number;
  cleanliness?: number;
  accuracy?: number;
  checkin?: number;
  communication?: number;
  location?: number;
  value?: number;
}

export interface IListing extends Document {
  host: Types.ObjectId;
  name: string;
  description?: string;
  summary?: string;
  space?: string;
  transitInfo?: string;
  houseRules?: string;
  propertyType: string;
  roomType: 'entire_place' | 'private_room' | 'shared_room' | 'hotel_room';
  location: ILocation;
  capacity: ICapacity;
  pricing: IPricing;
  bookingRules: IBookingRules;
  amenities: string[];
  photos: IPhoto[];
  reviewScores?: IReviewScores;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>({
  url: {
    type: String,
    required: true
  },
  caption: String,
  isCover: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const locationSchema = new Schema<ILocation>({
  address: String,
  city: {
    type: String,
    required: true
  },
  state: String,
  country: {
    type: String,
    required: true
  },
  zipCode: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  }
}, { _id: false });

// Create 2dsphere index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

const capacitySchema = new Schema<ICapacity>({
  accommodates: {
    type: Number,
    required: true,
    min: 1
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  beds: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0.5
  }
}, { _id: false });

const pricingSchema = new Schema<IPricing>({
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    min: 0
  },
  cleaningFee: {
    type: Number,
    min: 0
  }
}, { _id: false });

const bookingRulesSchema = new Schema<IBookingRules>({
  minimumNights: {
    type: Number,
    default: 1,
    min: 1
  },
  maximumNights: Number,
  checkInTime: String,
  checkOutTime: String,
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super_strict'],
    required: true,
    default: 'moderate'
  },
  instantBookable: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const reviewScoresSchema = new Schema<IReviewScores>({
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  cleanliness: {
    type: Number,
    min: 0,
    max: 5
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 5
  },
  checkin: {
    type: Number,
    min: 0,
    max: 5
  },
  communication: {
    type: Number,
    min: 0,
    max: 5
  },
  location: {
    type: Number,
    min: 0,
    max: 5
  },
  value: {
    type: Number,
    min: 0,
    max: 5
  }
}, { _id: false });

const listingSchema = new Schema<IListing>({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Listing name is required'],
    trim: true
  },
  description: String,
  summary: String,
  space: String,
  transitInfo: String,
  houseRules: String,
  propertyType: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['entire_place', 'private_room', 'shared_room', 'hotel_room']
  },
  location: {
    type: locationSchema,
    required: true
  },
  capacity: {
    type: capacitySchema,
    required: true
  },
  pricing: {
    type: pricingSchema,
    required: true
  },
  bookingRules: {
    type: bookingRulesSchema,
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  photos: {
    type: [photoSchema],
    default: []
  },
  reviewScores: reviewScoresSchema,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for common queries
listingSchema.index({ host: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ 'location.country': 1 });
listingSchema.index({ propertyType: 1 });
listingSchema.index({ 'pricing.pricePerNight': 1 });
listingSchema.index({ amenities: 1 });

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;
