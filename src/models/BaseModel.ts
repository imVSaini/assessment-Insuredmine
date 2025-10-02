import { Document, Model, Schema } from 'mongoose'

/**
 * Base interface for all models
 */
export interface BaseDocument extends Document {
  createdAt: Date
  updatedAt: Date
}

/**
 * Base schema with common fields
 */
export const baseSchema = new Schema<BaseDocument>(
  {},
  {
    timestamps: true,
    versionKey: false,
  }
)

/**
 * Base model class with common methods
 */
export class BaseModel<T extends BaseDocument> {
  protected model: Model<T>

  constructor(model: Model<T>) {
    this.model = model
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec()
  }

  /**
   * Find all documents
   */
  async findAll(): Promise<T[]> {
    return this.model.find().exec()
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data)
    return document.save()
  }

  /**
   * Update document by ID
   */
  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec()
  }

  /**
   * Delete document by ID
   */
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec()
  }

  /**
   * Count documents
   */
  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec()
  }
}
