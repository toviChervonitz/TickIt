import { sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { todo } from "node:test";

export async function POST(req: Request) {
  // TODO לבדוק שהמייל לא קיים במערכת
  // או פה או לפני הקריאה לפונקציה הזאת
  try {
    const { name, email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const tempPassword = generatePassword(8);
    //needed??
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // TODO store email and password in db

    //take manger mail/name
    await sendPasswordEmail(email, tempPassword, "manger");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
