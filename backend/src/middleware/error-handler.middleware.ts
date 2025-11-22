import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof Error) {
    const e = err as any;
    const status = e.status ?? 500;

    if (status === 500) {
      console.error(err);
    }

    return res.status(status).json({
      status,
      message: err.message,
      code: e.code,
    });
  }

  console.error('Unknown error:', err);

  return res.status(500).json({
    status: 500,
    message: 'Internal Server Error',
  });
}
