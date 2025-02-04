export type JwtPayload = {
  id: string;
  email: string;
  type: 'company' | 'employee';
  role?: string;
  companyId: string;
};
