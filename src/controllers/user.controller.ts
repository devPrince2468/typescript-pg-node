import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { userService } from "../services/user.service";
import { User } from "../entities/User";

export const userController = {
  register: async (req, res, next) => {
    try {
      const { file, body } = req;
      if (!file) {
        return res.status(400).json({ message: "Image is required" });
      }
      const user = plainToInstance(User, body);
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json(errors);
      }

      const response = await userService.registerUserService({
        ...body,
        image: file.filename,
      });

      res.status(201).json({
        name: response.savedUser.name,
        email: response.savedUser.email,
        id: response.savedUser.id,
        image: response.savedUser.image,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res) => {
    try {
      const credentials = req.body;
      const response = await userService.loginUserService(credentials);
      res
        .cookie("token", response, {
          // httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 1000,
        })
        .json({ message: "Logged in successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("token", {
        // httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error logging out", error });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await userService.getUsersService();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  },
};
export default userController;
