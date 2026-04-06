import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Record from '../models/Record';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { createBadRequestError, createNotFoundError } from '../utils/errors';
import {
  ensureDate,
  ensureNonEmptyString,
  ensureOptionalString,
  ensurePositiveNumber,
  ensureRecordType,
  getQueryNumber,
  getQueryString
} from '../utils/validation';

interface CreateRecordBody {
  amount: unknown;
  type: unknown;
  category: unknown;
  date: unknown;
  notes?: unknown;
  userId?: unknown;
}

interface UpdateRecordBody {
  amount?: unknown;
  type?: unknown;
  category?: unknown;
  date?: unknown;
  notes?: unknown;
}

interface RecordParams {
  id: string;
}

interface RecordQuery {
  page?: string;
  limit?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const createRecord = asyncHandler(async (req: Request<{}, {}, CreateRecordBody>, res: Response) => {
  const amount = ensurePositiveNumber(req.body.amount, 'amount');
  const type = ensureRecordType(req.body.type);
  const category = ensureNonEmptyString(req.body.category, 'category');
  const date = ensureDate(req.body.date, 'date');
  const notes = ensureOptionalString(req.body.notes, 'notes');

  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  const record = await Record.create({
    userId: new mongoose.Types.ObjectId(req.user.id),
    amount,
    type,
    category,
    date,
    notes,
    isDeleted: false
  });

  const balanceAdjustment = type === 'income' ? amount : -amount;
  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(req.user.id) },
    {
      $inc: { balance: balanceAdjustment },
      lastBalanceUpdate: new Date()
    }
  );

  res.status(201).json({
    message: 'Record created successfully',
    record
  });
});

export const listRecords = asyncHandler(async (req: Request<{}, {}, {}, RecordQuery>, res: Response) => {
  const page = getQueryNumber(req.query.page, 'page', 1, 1, 1000000);
  const limit = getQueryNumber(req.query.limit, 'limit', 10, 1, 100);

  const type = getQueryString(req.query.type);
  const category = getQueryString(req.query.category);
  const startDate = getQueryString(req.query.startDate);
  const endDate = getQueryString(req.query.endDate);

  const filter: {
    isDeleted: boolean;
    type?: 'income' | 'expense';
    category?: { $regex: string; $options: string };
    date?: { $gte?: Date; $lte?: Date };
  } = {
    isDeleted: false
  };

  if (type !== undefined) {
    filter.type = ensureRecordType(type);
  }

  if (category !== undefined) {
    filter.category = { $regex: category, $options: 'i' };
  }

  if (startDate !== undefined || endDate !== undefined) {
    filter.date = {};
    if (startDate !== undefined) {
      filter.date.$gte = ensureDate(startDate, 'startDate');
    }
    if (endDate !== undefined) {
      filter.date.$lte = ensureDate(endDate, 'endDate');
    }
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    Record.countDocuments(filter)
  ]);

  res.status(200).json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    records
  });
});

export const getRecordById = asyncHandler(async (req: Request<RecordParams>, res: Response) => {
  const record = await Record.findOne({
    _id: req.params.id,
    isDeleted: false
  });
  if (!record) {
    throw createNotFoundError('Record not found');
  }

  res.status(200).json({ record });
});

export const updateRecord = asyncHandler(async (req: Request<RecordParams, {}, UpdateRecordBody>, res: Response) => {
  const updatePayload: {
    amount?: number;
    type?: 'income' | 'expense';
    category?: string;
    date?: Date;
    notes?: string | undefined;
  } = {};

  if (req.body.amount !== undefined) {
    updatePayload.amount = ensurePositiveNumber(req.body.amount, 'amount');
  }

  if (req.body.type !== undefined) {
    updatePayload.type = ensureRecordType(req.body.type);
  }

  if (req.body.category !== undefined) {
    updatePayload.category = ensureNonEmptyString(req.body.category, 'category');
  }

  if (req.body.date !== undefined) {
    updatePayload.date = ensureDate(req.body.date, 'date');
  }

  if (req.body.notes !== undefined) {
    updatePayload.notes = ensureOptionalString(req.body.notes, 'notes');
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createBadRequestError('No valid fields to update');
  }

  const updatedRecord = await Record.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  });

  if (!updatedRecord) {
    throw createNotFoundError('Record not found');
  }

  res.status(200).json({
    message: 'Record updated successfully',
    record: updatedRecord
  });
});

export const deleteRecord = asyncHandler(async (req: Request<RecordParams>, res: Response) => {
  const record = await Record.findById(req.params.id);
  if (!record) {
    throw createNotFoundError('Record not found');
  }

  if (record.isDeleted) {
    throw createNotFoundError('Record not found');
  }

  await Record.updateOne(
    { _id: req.params.id },
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  const balanceReversal = record.type === 'income' ? -record.amount : record.amount;
  await User.updateOne(
    { _id: record.userId },
    {
      $inc: { balance: balanceReversal },
      lastBalanceUpdate: new Date()
    }
  );

  res.status(200).json({ message: 'Record deleted successfully' });
});
