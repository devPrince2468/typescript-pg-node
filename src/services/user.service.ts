import bcrypt from "bcryptjs";
import { User } from "../entities/User";
import { userRepo } from "../repositories/user.repo";
import { generateTokenHS256 } from "../utils/jwt";
import { AppError } from "../helpers/AppError";
import { AppRoles } from "../access-control";

export const userService = {
  registerUserService: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User();
    user.name = userData.name;
    user.email = userData.email;
    user.password = hashedPassword;
    user.image = userData.image;
    user.role = userData.role || AppRoles.USER;

    try {
      const savedUser = await userRepo.save(user);
      return { message: "User registered successfully", savedUser };
    } catch (err) {
      if (err?.code === "23505") {
        throw new AppError("Email already exists", 409);
      }
      throw new AppError("User registration failed", 500);
    }
  },

  loginUserService: async (credentials) => {
    const user = await userRepo.findOneBy({ email: credentials.email });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    const userPayload = { id: user.id, email: user.email, role: user.role };

    // Generate JWT
    // const token = generateToken(userPayload);
    const token = generateTokenHS256(userPayload);

    if (!token) {
      throw new AppError("Token generation failed", 500);
    }

    return token;
  },
  getUsersService: async () => {
    const users = await userRepo.find({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        orders: {
          id: true,
          createdAt: true,
          status: true,
          items: {
            quantity: true,
            product: {
              title: true,
              price: true,
              image: true,
            },
          },
        },
      },
      relations: {
        orders: {
          items: {
            product: true,
          },
        },
      },
    });
    if (!users) {
      throw new AppError("No users found", 404);
    }
    console.log("Users found:", users);
    return users;
  },
};
