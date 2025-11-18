// /app/api/user/getId/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import bcrypt from "bcryptjs";
import { compareToken } from "@/app/lib/jwt";
import { hashPassword } from "@/app/lib/bcrypt";

// PUT: Update all user details by email
export async function PUT(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { userId, email, oldPassword, newPassword, ...updates } = data;


    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const compareTokenResult = compareToken(userId, authHeader!);
    if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { status: "error", message: "Both old and new password are required" },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { status: "error", message: "User not found" },
          { status: 404 }
        );
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password!);
      if (!isMatch) {
        return NextResponse.json(
          { status: "error", message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashed = await hashPassword(newPassword);
      updates.password = hashed;
    }

    // Find user by email and update all other fields
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      {
        new: true,
        runValidators: true,
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
