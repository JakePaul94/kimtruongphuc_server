import { Request } from 'express';
import { UserInstance } from '../models/userModel';

export type AuthRequest = Request & {
  user?: UserInstance;
};