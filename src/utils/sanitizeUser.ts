import { UserAttributes, UserInstance } from "../models/userModel";

export const sanitizeUser = (user: UserInstance) => {
  const raw: Partial<UserAttributes> = user.get({ plain: true });
  delete raw.password;
  return raw;
};
