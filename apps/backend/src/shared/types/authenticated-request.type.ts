import { Request } from 'express';
import { AuthenticatedUser } from '@poupig/shared';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
