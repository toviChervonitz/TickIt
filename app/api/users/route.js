import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}

// POST: Create a new user
export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const user = await User.create(data);
  return NextResponse.json(user, { status: 201 });
}

// PUT: Update user by ID (expects { id, ...fields })
export async function PUT(request) {
  await dbConnect();
  const data = await request.json();
  const { id, ...updates } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(user);
}

// DELETE: Delete user by ID (expects { id })
export async function DELETE(request) {
  await dbConnect();
  const data = await request.json();
  const { id } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  await User.findByIdAndDelete(id);
  return NextResponse.json({ message: "User deleted" });
}
