import { models} from "../config/database";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError"; // Import ApiError
import { UserAttributes } from "../models/userModel";
const User = models.User;

const userService = {
  getAllUsers: async (): Promise<Omit<UserAttributes, 'password'>[]> => {
    try {
      const users = await User.findAll();
  
      const plainUsers = users.map((user) => {
        const { password, ...rest } = user.get({ plain: true });
        return rest;
      });
  
      return plainUsers;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw new ApiError(500, "Failed to fetch users.");
    }
  },

  getUserById: async (id: number) => {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new ApiError(404, `User with ID ${id} not found.`);
      }
      return user;
    } catch (error: any) {
      console.error(`Error fetching user with ID ${id} and manager:`, error);
      throw new ApiError(500, "Failed to fetch user.");
    }
  },
  getAllUsersByBoilerId: async (boilerId: number) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model:  models.BoilerUser,
            as: 'boilerUsers',
            where: { boilerId },
            attributes: [], 
          },
        ],
      });
      return users;
    } catch (error) {
      throw new Error('Failed to fetch users by boilerId');
    }
  },
  createUser: async (userData: any) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUser = await User.create({
        ...userData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = newUser.get();

      return userWithoutPassword;
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ApiError(400, "PhoneNumber or email already exists.");
      }
      throw new ApiError(500, "Failed to create user.");
    }
  },
};

export default userService;
