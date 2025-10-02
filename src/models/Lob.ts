import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

export interface ILOB extends BaseDocument {
  name: string
  description?: string
  code?: string
  isActive: boolean
}

const lobSchema = new Schema<ILOB>(
  {
    name: {
      type: String,
      required: [true, 'LOB name is required'],
      trim: true,
      maxlength: [100, 'LOB name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [20, 'Code cannot exceed 20 characters'],
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

lobSchema.index({ name: 1 })
lobSchema.index({ code: 1 })
lobSchema.index({ isActive: 1 })

// Virtual relationships
lobSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'lobId',
})

// Ensure virtual fields are serialized
lobSchema.set('toJSON', { virtuals: true })
lobSchema.set('toObject', { virtuals: true })

export const LOB = model<ILOB>('LOB', lobSchema)
