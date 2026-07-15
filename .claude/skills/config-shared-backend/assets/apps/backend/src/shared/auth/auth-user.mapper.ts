import { AuthenticatedUser } from '{{SHARED_PACKAGE}}';
import { JwtPayload } from '../types/jwt-payload.type';

export function mapPayloadToAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
  };
}
