// /app/api/user/getId/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", userId: user._id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get User ID Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

// PUT: Update all user details by email
export async function PUT(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { email, ...updates } = data;

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
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
