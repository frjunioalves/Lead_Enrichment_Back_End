import type { Request, Response, NextFunction } from 'express';
import { LeadHistoryService } from '../services/leadHistory.service.js';

// req.user é garantido pelo authMiddleware que protege esta rota — o "!" é seguro aqui
export async function listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await LeadHistoryService.listByUser(req.user!.id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
}
