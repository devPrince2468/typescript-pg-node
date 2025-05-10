// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// Load EC keys
const privateKey = fs.readFileSync(
  path.join(__dirname, "../keys/ec-private-key.pem"),
  "utf8"
);
const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/ec-public-key.pem"),
  "utf8"
);

export interface JwtPayload {
  id: number;
  email: string;
}

// Original ES256 methods
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: "ES256",
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as JwtPayload;
};

export const generateTokenHS256 = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

export const verifyTokenHS256 = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as JwtPayload;
};
