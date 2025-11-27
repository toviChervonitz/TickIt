import { dbConnect } from "@/app/lib/DB";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import { createAuthResponse } from "@/app/lib/jwt";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, image } = body;

    if (!name || !email) {
      return NextResponse.json(
        { message: "Missing required Google user data" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });

    if (user) {
      user.image = image || user.image;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        image: image || "",
        password: null,
      });
    }

    return createAuthResponse(user.toObject(), `user, Welcome ${name}!`);
  } catch (error) {
    console.error("❌ Google signup error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
