import type { Request, Response, NextFunction } from 'express';
import { LeadHistoryService } from '../services/leadHistory.service.js';

export async function listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await LeadHistoryService.listByUser(req.user!.id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
}
