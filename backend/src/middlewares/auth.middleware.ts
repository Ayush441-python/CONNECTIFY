import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { getAuth } from '@clerk/express';
import prisma from '../config/db';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    
    if (!auth || !auth.userId) {
      return next(ApiError.unauthorized('Authentication token missing or invalid'));
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId }
    });

    if (!user) {
      return next(ApiError.unauthorized('User is authenticated with Clerk but not fully onboarded in our database'));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Attaches req.user if a valid token is present, but never rejects the request. */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId }
      });
      if (user) {
        req.user = { id: user.id, role: user.role };
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}
