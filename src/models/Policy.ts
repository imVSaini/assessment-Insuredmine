import { model, Schema, Types } from 'mongoose'

import { BaseDocument } from './BaseModel'

export enum PolicyMode {
  MONTHLY = 6,
  QUARTERLY = 3,
  SEMI_ANNUAL = 2,
  ANNUAL = 12,
}

export enum PolicyType {
  SINGLE = 'Single',
  MULTIPLE = 'Multiple',
  GROUP = 'Group',
}

export interface IPolicy extends BaseDocument {
  policyNumber: string
  policyType: PolicyType
  policyMode: PolicyMode
  premiumAmountWritten?: number
  premiumAmount?: number
  policyStartDate: Date
  policyEndDate: Date
  producer?: string
  csr?: string
  userId: Types.ObjectId
  agentId: Types.ObjectId
  carrierId: Types.ObjectId
  policyCategoryId: Types.ObjectId
  hasActiveClientPolicy?: boolean
  isActive: boolean
}

const policySchema = new Schema<IPolicy>(
  {
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Policy number cannot exceed 50 characters'],
    },
    policyType: {
      type: String,
      required: [true, 'Policy type is required'],
      enum: {
        values: Object.values(PolicyType),
        message: 'Policy type must be one of: Single, Multiple, Group',
      },
    },
    policyMode: {
      type: Number,
      required: [true, 'Policy mode is required'],
      enum: {
        values: Object.values(PolicyMode),
        message: 'Policy mode must be one of: 6, 3, 2, 12',
      },
    },
    premiumAmountWritten: {
      type: Number,
      min: [0, 'Premium amount written cannot be negative'],
    },
    premiumAmount: {
      type: Number,
      min: [0, 'Premium amount cannot be negative'],
    },
    policyStartDate: {
      type: Date,
      required: [true, 'Policy start date is required'],
    },
    policyEndDate: {
      type: Date,
      required: [true, 'Policy end date is required'],
      validate: {
        validator: function (value: Date) {
          return value > this.policyStartDate
        },
        message: 'Policy end date must be after start date',
      },
    },
    producer: {
      type: String,
      trim: true,
      maxlength: [100, 'Producer name cannot exceed 100 characters'],
    },
    csr: {
      type: String,
      trim: true,
      maxlength: [100, 'CSR name cannot exceed 100 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Agent ID is required'],
    },
    carrierId: {
      type: Schema.Types.ObjectId,
      ref: 'Carrier',
      required: [true, 'Agent ID is required'],
    },
    policyCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'PolicyCategory',
      required: [true, 'Policy Category ID is required'],
    },
    hasActiveClientPolicy: {
      type: Boolean,
      default: false,
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

policySchema.index({ userId: 1 })
policySchema.index({ agentId: 1 })
policySchema.index({ carrierId: 1 })
policySchema.index({ policyCategoryId: 1 })
policySchema.index({ policyStartDate: 1, policyEndDate: 1 })
policySchema.index({ isActive: 1 })

// Virtual relationships
policySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
})

policySchema.virtual('agent', {
  ref: 'Agent',
  localField: 'agentId',
  foreignField: '_id',
  justOne: true,
})

policySchema.virtual('carrier', {
  ref: 'Carrier',
  localField: 'carrierId',
  foreignField: '_id',
  justOne: true,
})

policySchema.virtual('policyCategory', {
  ref: 'PolicyCategory',
  localField: 'policyCategoryId',
  foreignField: '_id',
  justOne: true,
})

// Ensure virtual fields are serialized
policySchema.set('toJSON', { virtuals: true })
policySchema.set('toObject', { virtuals: true })

export const Policy = model<IPolicy>('Policy', policySchema)
