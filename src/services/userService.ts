import { models } from "../config/database";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError"; // Import ApiError
const User = models.User;

const userService = {
  getAllUsersWithManagers: async () => {
    try {
      const users = await User.findAll({
        attributes: ["id", "fullName", "email", "phoneNumber"], 
        include: [
          {
            model: User,
            as: "Manager",
            attributes: ["id", "fullName", "email", "phoneNumber"], 
          },
        ],
      });
      const plainUsers = users.map((user) => user.get({ plain: true }));
      console.log(plainUsers);
      return users;
    } catch (error: any) {
      console.error("Error fetching users with managers:", error);
      throw new ApiError(500, "Failed to fetch users.");
    }
  },

  getUserByIdWithManager: async (id: number) => {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: User,
            as: "Manager",
            attributes: ["id", "fullName", "email"],
          },
        ],
      });
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
            model: BoilerUser,
            as: 'boilerUsers',
            where: { boilerId },
            attributes: [], // không lấy trường của BoilerUser
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
        throw new ApiError(400, "Username or email already exists.");
      }
      throw new ApiError(500, "Failed to create user.");
    }
  },
};

export default userService;
