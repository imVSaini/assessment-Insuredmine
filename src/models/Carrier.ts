import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

export interface ICarrier extends BaseDocument {
  name: string
  code?: string
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  isActive: boolean
}

const carrierSchema = new Schema<ICarrier>(
  {
    name: {
      type: String,
      required: [true, 'Carrier name is required'],
      trim: true,
      maxlength: [100, 'Carrier name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s()-]+$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/,
        'Please provide a valid email',
      ],
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

carrierSchema.index({ name: 1 })
carrierSchema.index({ code: 1 })
carrierSchema.index({ isActive: 1 })

// Virtual relationships
carrierSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'carrierId',
})

// Ensure virtual fields are serialized
carrierSchema.set('toJSON', { virtuals: true })
carrierSchema.set('toObject', { virtuals: true })

export const Carrier = model<ICarrier>('Carrier', carrierSchema)
