import { UserInstance } from '../models/userModel';

declare module 'express' {
  interface Request {
    user?: UserInstance;
  }
}