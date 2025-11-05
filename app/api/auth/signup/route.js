import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  await dbConnect();
  const { name, email, password } = await request.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const user = await User.create({ name, email, password });
  return NextResponse.json({ message: "User created successfully", user });
}
