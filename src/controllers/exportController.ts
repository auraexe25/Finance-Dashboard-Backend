import { Request, Response } from 'express';
import Record from '../models/Record';
import { asyncHandler } from '../utils/asyncHandler';
import { createBadRequestError } from '../utils/errors';
import { ensureDate, getQueryString } from '../utils/validation';

interface ExportQuery {
  startDate?: string;
  endDate?: string;
  format?: string;
}

const generateCSV = (records: any[]): string => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  const headerRow = headers.join(',');

  const dataRows = records.map((record) => {
    const date = new Date(record.date).toISOString().split('T')[0];
    const type = record.type;
    const category = `"${(record.category || '').replace(/"/g, '""')}"`;
    const amount = record.amount.toString();
    const notes = `"${(record.notes || '').replace(/"/g, '""')}"`;

    return [date, type, category, amount, notes].join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

export const exportRecordsCSV = asyncHandler(async (req: Request<{}, {}, {}, ExportQuery>, res: Response) => {
  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  const startDateQuery = getQueryString(req.query.startDate);
  const endDateQuery = getQueryString(req.query.endDate);

  const filter: { isDeleted: boolean; date?: { $gte?: Date; $lte?: Date } } = {
    isDeleted: false
  };

  if (startDateQuery !== undefined || endDateQuery !== undefined) {
    filter.date = {};
    if (startDateQuery !== undefined) {
      filter.date.$gte = ensureDate(startDateQuery, 'startDate');
    }
    if (endDateQuery !== undefined) {
      filter.date.$lte = ensureDate(endDateQuery, 'endDate');
    }
  }

  const records = await Record.find(filter).sort({ date: -1 });

  const csvContent = generateCSV(records);

  const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

export const exportRecordsJSON = asyncHandler(async (req: Request<{}, {}, {}, ExportQuery>, res: Response) => {
  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  const startDateQuery = getQueryString(req.query.startDate);
  const endDateQuery = getQueryString(req.query.endDate);

  const filter: { isDeleted: boolean; date?: { $gte?: Date; $lte?: Date } } = {
    isDeleted: false
  };

  if (startDateQuery !== undefined || endDateQuery !== undefined) {
    filter.date = {};
    if (startDateQuery !== undefined) {
      filter.date.$gte = ensureDate(startDateQuery, 'startDate');
    }
    if (endDateQuery !== undefined) {
      filter.date.$lte = ensureDate(endDateQuery, 'endDate');
    }
  }

  const records = await Record.find(filter).sort({ date: -1 });

  const filename = `transactions_${new Date().toISOString().split('T')[0]}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json({
    exportDate: new Date().toISOString(),
    totalRecords: records.length,
    records
  });
});
