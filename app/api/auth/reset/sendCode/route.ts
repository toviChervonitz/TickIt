import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ResetCode from "@/app/models/ResetCodeModel";
import { sendResetCodeEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiration timestamp (10 min)
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Save or update code in DB
    await ResetCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true }
    );

    // Send code by email
    await sendResetCodeEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending reset code:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
