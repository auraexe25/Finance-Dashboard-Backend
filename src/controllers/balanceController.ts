import { Request, Response } from 'express';
import User from '../models/User';
import Record from '../models/Record';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureDate, getQueryNumber, getQueryString } from '../utils/validation';

interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  limit?: string;
  type?: string;
}

export const getDashboardWithBalance = asyncHandler(async (req: Request<{}, {}, {}, DashboardQuery>, res: Response) => {
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

  const allUsers = await User.find({ status: 'Active' }).select('_id name balance email lastBalanceUpdate').sort({ balance: -1 });

  const totalUsersBalance = allUsers.reduce((sum, user) => sum + (user.balance || 0), 0);

  res.status(200).json({
    summary: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    },
    userBalances: {
      totalUsers: allUsers.length,
      totalUsersBalance,
      averageBalancePerUser: allUsers.length > 0 ? totalUsersBalance / allUsers.length : 0,
      users: allUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0,
        lastBalanceUpdate: user.lastBalanceUpdate
      }))
    }
  });
});

export const getUsersBalanceReport = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({ status: 'Active' }).select('_id name email balance lastBalanceUpdate role').sort({ balance: -1 });

  const balanceDistribution = {
    highBalance: users.filter((u) => (u.balance || 0) >= 10000).length,
    mediumBalance: users.filter((u) => (u.balance || 0) >= 1000 && (u.balance || 0) < 10000).length,
    lowBalance: users.filter((u) => (u.balance || 0) > 0 && (u.balance || 0) < 1000).length,
    zeroBalance: users.filter((u) => (u.balance || 0) === 0).length,
    negativeBalance: users.filter((u) => (u.balance || 0) < 0).length
  };

  res.status(200).json({
    totalUsers: users.length,
    totalBalanceValue: users.reduce((sum, u) => sum + (u.balance || 0), 0),
    averageBalance: users.length > 0 ? users.reduce((sum, u) => sum + (u.balance || 0), 0) / users.length : 0,
    balanceDistribution,
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance || 0,
      lastBalanceUpdate: user.lastBalanceUpdate
    }))
  });
});
