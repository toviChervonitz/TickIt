
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
import useAppStore from "../store/useAppStore";
import ChatMessageComp from "./ChatMessage";
import { get } from "http";
import { getTranslation } from "../lib/i18n";

export default function Chat() {
  const t=getTranslation();
  const { projectId, user, messages, setMessages } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [skip, setSkip] = useState(0); // how many messages already fetched
  const limit = 30;
  const shouldAutoScrollRef = useRef(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const isFetchingRef = useRef(false);

  /** Scroll to bottom on updates */
useEffect(() => {
  requestAnimationFrame(() => {
    // Do not scroll if triggered by lazy-loading older messages
    if (!shouldAutoScrollRef.current) {
      shouldAutoScrollRef.current = true; // reset for next event
      return;
    }

    // First load → jump
    if (initialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      initialLoadRef.current = false;
    } else {
      // New messages → smooth to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });
}, [messages]);
  /** Initial fetch */
  useEffect(() => {
    if (!projectId || messages.length > 0) return;

    (async () => {
      const chat = await getChatMessages(projectId, 0, limit);

      const safeMessages = chat.map((m: any) => ({
        ...m,
        user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
      }));

      setMessages(safeMessages);
      setSkip(limit);
    })();
  }, [projectId, messages, setMessages]);

  /** Lazy load older messages when reaching the top */
  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isFetchingRef.current) return;

    if (container.scrollTop <= 0) {
      isFetchingRef.current = true;

      const oldHeight = container.scrollHeight;
  shouldAutoScrollRef.current = false;  // <<<<<< ADD THIS

      const older = await getChatMessages(projectId!, skip, limit);
      if (older.length === 0) {
        isFetchingRef.current = false;
        return;
      }

      const safe = older.map((m: any) => ({
        ...m,
        user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
      }));

      // prepend older messages
      const currentMessages = useAppStore.getState().messages;
      setMessages([...safe, ...currentMessages]);

      setSkip(skip + limit);

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - oldHeight; // preserve scroll position
      });

      isFetchingRef.current = false;
    }
  }, [projectId, skip, limit, setMessages]);

  /** Attach scroll listener */
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /** Real-time Pusher */
  useEffect(() => {
    if (!projectId || !user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-project-${projectId}`);

    channel.bind("chatMessage-updated", (data: any) => {
      if (data.action === "ADD" && data.chatMessage) {
        const incoming = {
          ...data.chatMessage,
          user: data.chatMessage.user ?? { _id: "unknown", name: "Unknown", image: undefined },
        };

        const current = useAppStore.getState().messages;
        setMessages([...current, incoming]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [projectId, user, setMessages]);

  /** Send Message */
  const handleSend = async () => {
    if (!newMessage.trim() || !user || !projectId) return;

    setLoading(true);
    try {
      await sendChatMessage({
        userId: user._id,
        projectId,
        message: newMessage.trim(),
      });
      setNewMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          background: "#f9f9f9",
        }}
      >
{messages.map((msg, index) => {
  const msgUser = msg.user ?? { _id: "unknown", name: "Unknown" };
  const isMe = msgUser._id === user?._id;
  return (
    <ChatMessageComp
      key={msg.id ?? index}
      username={isMe ? "" : msgUser.name}
      profileImage={msgUser.image}
      message={msg.message}
      time={msg.createdAt} // <-- just pass the raw value
      isCurrentUser={isMe}
    />
  );
})}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", padding: "16px", gap: "8px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          style={{ flex: 1, border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
          placeholder={t("typeMessage")}
        />
        <button
          disabled={!newMessage.trim() || loading}
          onClick={handleSend}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
          }}
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
