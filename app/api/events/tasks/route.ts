export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";

let clients: { id: number; send: (data: any) => void }[] = [];

export async function GET(req: NextRequest) {
  console.log("🔌 New SSE connection request");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now();

      const send = (data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (err) {
          console.log("❌ Stream error:", err);
        }
      };

      clients.push({ id: clientId, send });
      console.log("🟢 Client connected:", clientId);

      send({ type: "connected", id: clientId });

      req.signal.addEventListener("abort", () => {
        console.log("🔴 Removing dead SSE client:", clientId);
        clients = clients.filter((c) => c.id !== clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",   
      "Keep-Alive": "timeout=600",         
    },
  });
}

export function broadcastTask(task: any) {
  console.log(`📡 Broadcasting new task to ${clients.length} clients`);

  clients.forEach((client) => {
    try {
      client.send({ type: "task", task });
    } catch {
      console.log("❌ Removing dead SSE client:", client.id);
      clients = clients.filter((c) => c.id !== client.id);
    }
  });
}
