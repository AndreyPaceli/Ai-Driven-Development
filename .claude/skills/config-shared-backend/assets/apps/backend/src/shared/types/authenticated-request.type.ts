import { Request } from 'express';
import { AuthenticatedUser } from '{{SHARED_PACKAGE}}';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
