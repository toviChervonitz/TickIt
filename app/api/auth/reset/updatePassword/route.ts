import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/UserModel";
import ResetCode from "@/app/models/ResetCodeModel";
import { dbConnect } from "@/app/lib/DB";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cleanup reset code
    await ResetCode.deleteOne({ email });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating password:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
