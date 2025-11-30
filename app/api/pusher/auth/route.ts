// app/api/pusher/auth/route.ts

import { NextResponse } from 'next/server';
import Pusher from 'pusher'; // ספריית השרת

// ודא שמשתני הסביבה האלו מוגדרים ב-.env.local
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export async function POST(req: Request) {
    // 1. קריאת socket_id ו-channel_name מתוך גוף הבקשה (Form Data)
    const formData = await req.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    try {
        const authResponse = pusher.authorizeChannel(socketId, channelName);
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error("Pusher Auth Error:", error);
        return new NextResponse("Pusher authorization failed", { status: 500 });
    }
}