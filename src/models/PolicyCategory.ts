import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

/**
 * PolicyCategory interface (Line of Business)
 */
export interface IPolicyCategory extends BaseDocument {
  categoryName: string
}

/**
 * PolicyCategory schema
 */
const policyCategorySchema = new Schema<IPolicyCategory>(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

/**
 * Create indexes
 */

/**
 * PolicyCategory model
 */
export const PolicyCategory = model<IPolicyCategory>(
  'PolicyCategory',
  policyCategorySchema
)
