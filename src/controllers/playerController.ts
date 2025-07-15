import { Request, Response, NextFunction } from 'express';

export const getPlayer = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameName, tag, region } = req.query;

    res.status(201).send('HEJ');
  } catch (error) {
    next(error);
  }
};
