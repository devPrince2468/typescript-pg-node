import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyToken, verifyTokenHS256 } from "../utils/jwt";
import { AppError } from "../helpers/AppError";
import ac from "../access-control";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { role: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    // const decoded = verifyToken(token);
    const decoded = verifyTokenHS256(token);
    console.log("Decoded token:", decoded);

    req.user = { ...decoded, role: decoded.role || "USER" };
    next();
  } catch (error) {
    // next(error);
    throw new AppError("Unauthorized", 401);
  }
};

export const authorize = (action: string, resource: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        throw new AppError("User role not found", 403);
      }
      const permission = ac.can(req.user.role)[action](resource);
      if (!permission.granted) {
        throw new AppError(
          "Forbidden: You do not have permission to perform this action",
          403
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
