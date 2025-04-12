// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

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

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: "ES256",
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as JwtPayload;
};
