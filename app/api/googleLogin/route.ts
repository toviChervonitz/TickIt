import { dbConnect } from "@/app/lib/DB";
import { createAuthResponse } from "@/app/lib/jwt";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import { firebaseAdmin } from "@/app/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { userData, token } = body;

    const { email, name, image } = userData;
    if (!email || !name) {
      return NextResponse.json(
        { message: "Missing Google user data" },
        { status: 400 }
      );
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 401 }
      );
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        image,
        password: "Aa1111",
      });
      await user.save();
    }

    return createAuthResponse(user.toObject(), "Login successful");
  } catch (error) {
    console.error("Google login error:", error || error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
