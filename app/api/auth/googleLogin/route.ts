// import { NextResponse } from "next/server";
// import { dbConnect } from "@/app/lib/DB";
// import User from "@/app/models/UserModel";
// import { createAuthResponse } from "@/app/lib/jwt";

// export async function POST(req: Request) {
//   await dbConnect();

//   try {
//     const body = await req.json();
//     const { email } = body;

//     if (!email) {
//       return NextResponse.json(
//         { status: "error", message: "Email is required" },
//         { status: 400 }
//       );
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return NextResponse.json(
//         { status: "error", message: "User not found" },
//         { status: 404 }
//       );
//     }

//     const userObj = user.toObject();
//     delete userObj.password;

//     return createAuthResponse(userObj, "Login successful");

//   } catch (err: any) {
//     console.error("Google Login Error:", err);
//     return NextResponse.json(
//       { status: "error", message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createAuthResponse } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
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

    const userObj = user.toObject();
    delete userObj.password;

    // ⬅️ פה גם ה-JWT נוצר וגם הקוקי נכתב וגם ה-token חוזר ב-JSON
    return createAuthResponse(userObj, "Login successful");
  } catch (err: any) {
    console.error("Google Login Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
