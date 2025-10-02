import { model, Schema, Types } from 'mongoose'

import { BaseDocument } from './BaseModel'

export enum AccountType {
  COMMERCIAL = 'Commercial',
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
}

export interface IUserAccount extends BaseDocument {
  accountName: string
  accountType: AccountType
  userId: Types.ObjectId
  isPrimary: boolean
  isActive: boolean
}

const userAccountSchema = new Schema<IUserAccount>(
  {
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters'],
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required'],
      enum: {
        values: Object.values(AccountType),
        message: 'Account type must be one of: Commercial, Personal, Business',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    isPrimary: {
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

userAccountSchema.index({ userId: 1 })
userAccountSchema.index({ accountType: 1 })
userAccountSchema.index({ isPrimary: 1 })
userAccountSchema.index({ isActive: 1 })

// Virtual relationships
userAccountSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
})

// Ensure virtual fields are serialized
userAccountSchema.set('toJSON', { virtuals: true })
userAccountSchema.set('toObject', { virtuals: true })

export const UserAccount = model<IUserAccount>('UserAccount', userAccountSchema)
