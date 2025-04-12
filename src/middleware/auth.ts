// src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../helpers/AppError";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    // next(error);
    throw new AppError("Unauthorized", 401);
  }
};
