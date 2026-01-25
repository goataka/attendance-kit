import { Request } from 'express';

/**
 * Authenticated request with user information
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}
