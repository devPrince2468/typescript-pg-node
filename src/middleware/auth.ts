import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyToken, verifyTokenHS256 } from "../utils/jwt";
import { AppError } from "../helpers/AppError";
import ac, { AppRoles } from "../access-control";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { role: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("Attempting to authenticate...");
  try {
    const authHeader = req.headers.authorization;
    console.log("[Auth Middleware] Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error(
        "[Auth Middleware] Missing or invalid Bearer token format."
      );
      throw new AppError("Missing or invalid token format", 401);
    }

    const token = authHeader.split(" ")[1];
    console.log("[Auth Middleware] Token received:", token);

    let decoded: JwtPayload | undefined = undefined;
    try {
      decoded = verifyTokenHS256(token);
      console.log("[Auth Middleware] Decoded token payload:", decoded);
    } catch (jwtError) {
      console.error(
        "[Auth Middleware] JWT Verification Error:",
        jwtError.message,
        jwtError.name
      );
      throw new AppError(`Invalid token: ${jwtError.message}`, 401);
    }

    if (!decoded) {
      console.error("[Auth Middleware] Token decoded to undefined or null.");
      throw new AppError("Invalid token: Could not decode.", 401);
    }

    const roleFromToken =
      typeof decoded.role === "string" ? decoded.role : AppRoles.USER;

    req.user = { ...decoded, role: roleFromToken };
    console.log("[Auth Middleware] User set on request:", req.user);
    next();
  } catch (error) {
    console.error(
      "[Auth Middleware] Error in authentication process:",
      error.message
    );
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Authentication failed", 401));
    }
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
