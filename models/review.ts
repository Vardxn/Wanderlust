import mongoose, { Schema, Document, Types } from 'mongoose';

interface IRatings {
  overall: number;
  cleanliness: number;
  accuracy: number;
  checkin: number;
  communication: number;
  location: number;
  value: number;
}

export interface IReview extends Document {
  booking: Types.ObjectId;
  guest: Types.ObjectId;
  listing: Types.ObjectId;
  ratings: IRatings;
  commentPublic?: string;
  commentPrivate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ratingsSchema = new Schema<IRatings>({
  overall: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  cleanliness: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  accuracy: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  checkin: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  location: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { _id: false });

const reviewSchema = new Schema<IReview>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  ratings: {
    type: ratingsSchema,
    required: true
  },
  commentPublic: String,
  commentPrivate: String
}, {
  timestamps: true
});

// Indexes for common queries
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ guest: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });

// Post-save hook to update listing's review scores
reviewSchema.post('save', async function() {
  const Listing = mongoose.model('Listing');
  
  // Aggregate all reviews for this listing
  const reviews = await mongoose.model('Review').find({ listing: this.listing });
  
  if (reviews.length === 0) return;
  
  const avgScores = {
    rating: 0,
    cleanliness: 0,
    accuracy: 0,
    checkin: 0,
    communication: 0,
    location: 0,
    value: 0
  };
  
  reviews.forEach(review => {
    avgScores.rating += review.ratings.overall;
    avgScores.cleanliness += review.ratings.cleanliness;
    avgScores.accuracy += review.ratings.accuracy;
    avgScores.checkin += review.ratings.checkin;
    avgScores.communication += review.ratings.communication;
    avgScores.location += review.ratings.location;
    avgScores.value += review.ratings.value;
  });
  
  const count = reviews.length;
  Object.keys(avgScores).forEach(key => {
    avgScores[key as keyof typeof avgScores] = Number((avgScores[key as keyof typeof avgScores] / count).toFixed(2));
  });
  
  await Listing.findByIdAndUpdate(this.listing, {
    reviewScores: avgScores
  });
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
