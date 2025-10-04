import { Request, RequestHandler, Response } from 'express'

import { Agent } from '@models/Agent'
import { Carrier } from '@models/Carrier'
import { Policy } from '@models/Policy'
import { PolicyCategory } from '@models/PolicyCategory'
import { User } from '@models/User'
import asyncHandler from '@utils/asyncHandler'

export const searchPoliciesByUsername: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username } = req.query
    const page = parseInt(req.query['page'] as string) || 1
    const limit = parseInt(req.query['limit'] as string) || 10
    const skip = (page - 1) * limit

    if (!username) {
      res.status(400).json({
        success: false,
        message: 'Username (email) parameter is required',
      })
      return
    }

    // Find user by email
    const user = await User.findOne({ email: username as string })
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    // Find policies for the user with populated references
    const policies = await Policy.find({ userId: user._id })
      .populate('agentId', 'name email phone')
      .populate('carrierId', 'name code')
      .populate('policyCategoryId', 'categoryName')
      .populate('userId', 'firstName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Policy.countDocuments({ userId: user._id })
    const pages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        policies,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })
  }
)

export const getAggregatedPolicies: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query['page'] as string) || 1
    const limit = parseInt(req.query['limit'] as string) || 10
    const userType = req.query['userType'] as string
    const skip = (page - 1) * limit

    // Build match criteria
    const matchCriteria: Record<string, unknown> = {}
    if (userType) {
      matchCriteria['user.userType'] = userType
    }

    // Aggregate policies grouped by user
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'user.agentId',
          foreignField: '_id',
          as: 'agent',
        },
      },
      {
        $unwind: '$agent',
      },
      {
        $lookup: {
          from: 'carriers',
          localField: 'carrierId',
          foreignField: '_id',
          as: 'carrier',
        },
      },
      {
        $unwind: '$carrier',
      },
      {
        $lookup: {
          from: 'policycategories',
          localField: 'policyCategoryId',
          foreignField: '_id',
          as: 'policyCategory',
        },
      },
      {
        $unwind: '$policyCategory',
      },
      {
        $match: matchCriteria,
      },
      {
        $group: {
          _id: '$userId',
          user: { $first: '$user' },
          agent: { $first: '$agent' },
          policyCount: { $sum: 1 },
          totalPremiumAmount: { $sum: '$premiumAmount' },
          policies: {
            $push: {
              _id: '$_id',
              policyNumber: '$policyNumber',
              policyType: '$policyType',
              policyStartDate: '$policyStartDate',
              policyEndDate: '$policyEndDate',
              premiumAmount: '$premiumAmount',
              carrier: '$carrier',
              policyCategory: '$policyCategory',
              isActive: '$isActive',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $sort: { 'user.firstName': 1 },
      },
    ]

    // Get total count for pagination
    const totalPipeline = [...aggregationPipeline, { $count: 'total' }]
    const totalResult = await Policy.aggregate(
      totalPipeline as Parameters<typeof Policy.aggregate>[0]
    )
    const total = totalResult.length > 0 ? totalResult[0].total : 0

    // Add pagination
    aggregationPipeline.push(
      { $skip: skip } as never,
      { $limit: limit } as never
    )

    const aggregatedPolicies = await Policy.aggregate(
      aggregationPipeline as Parameters<typeof Policy.aggregate>[0]
    )
    const pages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        aggregatedPolicies,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })
  }
)

export const getPolicyStats: RequestHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const [
      totalPolicies,
      totalUsers,
      totalAgents,
      totalCarriers,
      totalCategories,
      premiumStats,
    ] = await Promise.all([
      Policy.countDocuments(),
      User.countDocuments(),
      Agent.countDocuments(),
      Carrier.countDocuments(),
      PolicyCategory.countDocuments(),
      Policy.aggregate([
        {
          $group: {
            _id: null,
            totalPremium: { $sum: '$premiumAmount' },
            averagePremium: { $avg: '$premiumAmount' },
          },
        },
      ]),
    ])

    const averagePoliciesPerUser =
      totalUsers > 0 ? totalPolicies / totalUsers : 0
    const totalPremiumAmount =
      premiumStats.length > 0 ? premiumStats[0].totalPremium : 0

    res.json({
      success: true,
      data: {
        totalPolicies,
        totalUsers,
        totalAgents,
        totalCarriers,
        totalCategories,
        averagePoliciesPerUser: Math.round(averagePoliciesPerUser * 100) / 100,
        totalPremiumAmount: Math.round(totalPremiumAmount * 100) / 100,
      },
    })
  }
)
