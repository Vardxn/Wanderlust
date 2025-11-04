import mongoose, { Schema, Document } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

interface IHostProfile {
  hostSince?: Date;
  responseRate?: number;
  acceptanceRate?: number;
  isSuperhost: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  profilePictureUrl?: string;
  aboutText?: string;
  phoneNumber?: string;
  isHost: boolean;
  identityVerified: boolean;
  hostProfile?: IHostProfile;
  createdAt: Date;
  updatedAt: Date;
}

const hostProfileSchema = new Schema<IHostProfile>({
  hostSince: Date,
  responseRate: {
    type: Number,
    min: 0,
    max: 1
  },
  acceptanceRate: {
    type: Number,
    min: 0,
    max: 1
  },
  isSuperhost: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: String,
  profilePictureUrl: String,
  aboutText: String,
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isHost: {
    type: Boolean,
    default: false
  },
  identityVerified: {
    type: Boolean,
    default: false
  },
  hostProfile: hostProfileSchema
}, {
  timestamps: true
});

// Plugin for passport authentication
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
