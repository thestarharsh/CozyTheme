import { Request } from 'express';
import { User } from '@shared/schema';
import { AuthObject } from '@clerk/clerk-sdk-node';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthenticatedRequest extends Request {
  auth: AuthObject;
}

export interface AdminRequest extends AuthenticatedRequest {
  auth: AuthObject & {
    sessionClaims: {
      role: 'admin';
    };
  };
} 