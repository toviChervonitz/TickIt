"use server";

interface SendChatMessageProps {
  userId: string;
  projectId: string;
  message: string;
}

export async function sendChatMessage({
  userId,
  projectId,
  message,
}: SendChatMessageProps) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chatMessage/setMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // IMPORTANT: must include credentials (cookies) so JWT is attached
      credentials: "include",
      body: JSON.stringify({
        userId,
        projectId,
        message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send chat message");
    }

    return data.chatMessage;
  } catch (err: any) {
    console.error("Error sending chat message:", err);
    throw new Error(err.message || "Chat message error");
  }
}



export async function getChatMessages( projectId : string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/chatMessage/getMessages?projectId=${projectId}`,
      {
        method: "GET",
        credentials: "include", // needed for JWT cookie auth
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to fetch chat");
    }

    return data.chat; // array of messages
  } catch (err: any) {
    console.error("Error fetching chat messages:", err);
    throw new Error(err.message || "Chat fetch error");
  }
}

