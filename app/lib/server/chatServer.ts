
export async function sendChatMessage(payload: {
  userId: string;
  projectId: string;
  message: string;
}) {
  const res = await fetch("/api/chatMessage/setMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Message creation failed");
  return data.chatMessage;
}

export async function getChatMessages(
  projectId: string,
  skip: number = 0,
  limit: number = 30
) {
  const res = await fetch(
    `/api/chatMessage/getMessages?projectId=${projectId}&skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetching chat failed");

  return data.chat ?? [];
}
