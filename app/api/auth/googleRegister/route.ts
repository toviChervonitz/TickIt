import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json();
  const { name, email, image } = body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ status: "error", message: "User already exists" }, { status: 400 });
  }

  const user = await User.create({ name, email, image, provider: "google", password: "" });
  const token = createToken({ id: user._id, email: user.email });

  return NextResponse.json({ status: "success", user, token }, { status: 200 });
}
