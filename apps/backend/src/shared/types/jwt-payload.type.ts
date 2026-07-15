export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
};
