import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!; 

export function createToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}