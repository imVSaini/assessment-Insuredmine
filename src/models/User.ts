import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

export enum UserType {
  ACTIVE_CLIENT = 'Active Client',
  PROSPECT = 'Prospect',
  INACTIVE = 'Inactive',
}

export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export interface IUser extends BaseDocument {
  firstName: string
  lastName?: string
  email: string
  phone?: string
  gender?: UserGender
  dateOfBirth?: Date
  address?: string
  city?: string
  state?: string
  zip?: string
  userType: UserType
  applicantId?: string
  isActive: boolean
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s()-]+$/, 'Please provide a valid phone number'],
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(UserGender),
        message:
          'Gender must be one of: Male, Female, Other, Prefer not to say',
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          return !value || value < new Date()
        },
        message: 'Date of birth must be in the past',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    zip: {
      type: String,
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid ZIP code'], // eslint-disable-line security/detect-unsafe-regex
    },
    userType: {
      type: String,
      required: [true, 'User type is required'],
      enum: {
        values: Object.values(UserType),
        message: 'User type must be one of: Active Client, Prospect, Inactive',
      },
    },
    applicantId: {
      type: String,
      trim: true,
      maxlength: [50, 'Applicant ID cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

userSchema.index({ firstName: 1, lastName: 1 })
userSchema.index({ userType: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ applicantId: 1 })

// Virtual relationships
userSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'userId',
})

userSchema.virtual('accounts', {
  ref: 'UserAccount',
  localField: '_id',
  foreignField: 'userId',
})

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

export const User = model<IUser>('User', userSchema)
