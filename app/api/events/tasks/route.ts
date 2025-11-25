import { NextResponse } from "next/server";

export const runtime = "nodejs";

let clients: any[] = [];

export async function GET() {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const clientId = Date.now();
            const send = (data: any) =>
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

            clients.push({ id: clientId, send });

            send({ type: "connected", id: clientId });

            return () => {
                clients = clients.filter(c => c.id !== clientId);
            };
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}

// פונקציה לשרתי Next.js
export function broadcastTask(task: any) {
    clients = clients.filter(client => {
        try {
            console.log("🔊 Broadcasting new task to", clients.length, "clients");
            console.log("🆕 Task broadcasted:", task.title);
            client.send({ type: "taskCreated", task });
            return true; // נשאר בחיים
        } catch (err) {
            console.warn("Removing dead SSE client:", client.id);
            return false; // להוציא מהרשימה
        }
    });
}
