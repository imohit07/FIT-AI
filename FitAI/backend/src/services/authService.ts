import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { env } from "../config/env";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: IUser; token: string }> {
  const existing = await User.findByEmail(data.email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashed
  });

  const token = createToken(user.id);
  return { user, token };
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: IUser; token: string }> {
  const user = await User.findByEmail(data.email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const match = await bcrypt.compare(data.password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = createToken(user.id);
  return { user, token };
}

function createToken(userId: string) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: "7d" });
}
