// /app/api/user/getId/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { compareToken } from "@/app/lib/jwt";

// PUT: Update all user details by email
export async function PUT(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { id, email, ...updates } = data;

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const compareTokenResult = compareToken(id, authHeader!);
    if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email and update all other fields
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      {
        new: true, // Return updated document
        runValidators: true, // Apply schema validation
        // upsert: true, // Uncomment if you want to create if not exists
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Update User Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
