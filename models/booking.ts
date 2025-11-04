import mongoose, { Schema, Document, Types } from 'mongoose';

interface IPriceBreakdown {
  basePrice: number; // in cents
  cleaningFee?: number; // in cents
  serviceFee?: number; // in cents
  taxes?: number; // in cents
}

export interface IBooking extends Document {
  guest: Types.ObjectId;
  listing: Types.ObjectId;
  host: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: number; // in cents
  priceBreakdown?: IPriceBreakdown;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const priceBreakdownSchema = new Schema<IPriceBreakdown>({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  cleaningFee: {
    type: Number,
    min: 0
  },
  serviceFee: {
    type: Number,
    min: 0
  },
  taxes: {
    type: Number,
    min: 0
  }
}, { _id: false });

const bookingSchema = new Schema<IBooking>({
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
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(this: IBooking, value: Date) {
        return value > this.checkInDate;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceBreakdown: priceBreakdownSchema,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: String,
  specialRequests: String
}, {
  timestamps: true
});

// Indexes for common queries
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ listing: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(
  listingId: Types.ObjectId,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: Types.ObjectId
): Promise<boolean> {
  const query: any = {
    listing: listingId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return !conflictingBooking;
};

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
