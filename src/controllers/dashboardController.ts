import { Request, Response } from 'express';
import Record from '../models/Record';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureDate, ensureRecordType, getQueryNumber, getQueryString } from '../utils/validation';

interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  limit?: string;
  type?: string;
}

export const getDashboardSummary = asyncHandler(async (req: Request<{}, {}, {}, DashboardQuery>, res: Response) => {
  const startDateQuery = getQueryString(req.query.startDate);
  const endDateQuery = getQueryString(req.query.endDate);

  const matchStage: { isDeleted: boolean; date?: { $gte?: Date; $lte?: Date } } = { isDeleted: false };

  if (startDateQuery !== undefined || endDateQuery !== undefined) {
    matchStage.date = {};
    if (startDateQuery !== undefined) {
      matchStage.date.$gte = ensureDate(startDateQuery, 'startDate');
    }
    if (endDateQuery !== undefined) {
      matchStage.date.$lte = ensureDate(endDateQuery, 'endDate');
    }
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ];

  const summaryResults = await Record.aggregate(pipeline);

  const totalIncome = summaryResults.find((entry) => entry._id === 'income')?.totalAmount ?? 0;
  const totalExpenses = summaryResults.find((entry) => entry._id === 'expense')?.totalAmount ?? 0;

  res.status(200).json({
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses
  });
});

export const getCategoryBreakdown = asyncHandler(async (req: Request<{}, {}, {}, DashboardQuery>, res: Response) => {
  const startDateQuery = getQueryString(req.query.startDate);
  const endDateQuery = getQueryString(req.query.endDate);
  const typeQuery = getQueryString(req.query.type);

  const matchStage: { isDeleted: boolean; date?: { $gte?: Date; $lte?: Date }; type?: 'income' | 'expense' } = {
    isDeleted: false
  };

  if (startDateQuery !== undefined || endDateQuery !== undefined) {
    matchStage.date = {};
    if (startDateQuery !== undefined) {
      matchStage.date.$gte = ensureDate(startDateQuery, 'startDate');
    }
    if (endDateQuery !== undefined) {
      matchStage.date.$lte = ensureDate(endDateQuery, 'endDate');
    }
  }

  if (typeQuery !== undefined) {
    matchStage.type = ensureRecordType(typeQuery);
  }

  const breakdown = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$category'
        },
        totalAmount: { $sum: '$amount' },
        recordsCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        totalAmount: 1,
        recordsCount: 1
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  res.status(200).json({
    count: breakdown.length,
    breakdown
  });
});

export const getRecentActivity = asyncHandler(async (req: Request<{}, {}, {}, DashboardQuery>, res: Response) => {
  const limit = getQueryNumber(req.query.limit, 'limit', 10, 1, 50);

  const recentRecords = await Record.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { date: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        amount: 1,
        type: 1,
        category: 1,
        date: 1,
        notes: 1,
        user: {
          id: '$user._id',
          name: '$user.name',
          email: '$user.email'
        }
      }
    }
  ]);

  res.status(200).json({
    count: recentRecords.length,
    records: recentRecords
  });
});

export const getMonthlyTrends = asyncHandler(async (req: Request<{}, {}, {}, DashboardQuery>, res: Response) => {
  const startDateQuery = getQueryString(req.query.startDate);
  const endDateQuery = getQueryString(req.query.endDate);

  const matchStage: { isDeleted: boolean; date?: { $gte?: Date; $lte?: Date } } = { isDeleted: false };

  if (startDateQuery !== undefined || endDateQuery !== undefined) {
    matchStage.date = {};
    if (startDateQuery !== undefined) {
      matchStage.date.$gte = ensureDate(startDateQuery, 'startDate');
    }
    if (endDateQuery !== undefined) {
      matchStage.date.$lte = ensureDate(endDateQuery, 'endDate');
    }
  }

  const trends = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        totalAmount: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);

  res.status(200).json({
    count: trends.length,
    trends
  });
});
