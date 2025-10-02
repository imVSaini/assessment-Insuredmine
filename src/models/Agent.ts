import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

export interface IAgent extends BaseDocument {
  name: string
  agencyId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  isActive: boolean
}

const agentSchema = new Schema<IAgent>(
  {
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
      maxlength: [100, 'Agent name cannot exceed 100 characters'],
    },
    agencyId: {
      type: String,
      trim: true,
      maxlength: [50, 'Agency ID cannot exceed 50 characters'],
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
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s()-]+$/, 'Please provide a valid phone number'],
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

agentSchema.index({ name: 1 })
agentSchema.index({ agencyId: 1 })
agentSchema.index({ email: 1 })
agentSchema.index({ isActive: 1 })

// Virtual relationships
agentSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'agentId',
})

// Ensure virtual fields are serialized
agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

export const Agent = model<IAgent>('Agent', agentSchema)
