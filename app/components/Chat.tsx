"use client";

import React, { useEffect, useState, useRef } from "react";
import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
import useAppStore from "../store/useAppStore";
import ChatMessageComp from "./ChatMessage"; // <-- import the component

interface User {
  _id: string;
  name: string;
  image?: string;
}

interface ChatMessage {
  id: string;
  user: User;
  message: string;
  createdAt: string;
}

export default function Chat() {
  const { projectId, user, getProjectName } = useAppStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const chat = await getChatMessages(projectId!);
        setMessages(chat);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    }
    loadMessages();
  }, [projectId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message
  // const handleSend = async () => {
  //   if (!newMessage.trim()) return;

  //   setLoading(true);
  //   try {
  //     const chatMessage = await sendChatMessage({
  //       userId: user?._id!,
  //       projectId: projectId!,
  //       message: newMessage.trim(),
  //     });

  //     setMessages((prev) => [...prev, chatMessage]);
  //     setNewMessage("");
  //     scrollToBottom();
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSend = async () => {
  if (!newMessage.trim()) return;

  setLoading(true);

  try {
    // Send message to backend
    const response = await sendChatMessage({
      userId: user?._id!,
      projectId: projectId!,
      message: newMessage.trim(),
    });

    // Extract the returned populated message
    const chatMessage = response.chatMessage;

    // Add to state
    setMessages((prev) => [...prev, chatMessage]);

    // Clear input
    setNewMessage("");

    // Scroll to bottom
    scrollToBottom();

  } catch (err) {
    console.error("Failed to send message:", err);
  } finally {
    setLoading(false);
  }
};

  // Enter key send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded shadow-md">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 font-bold text-lg">
        {getProjectName(projectId!)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const msgUser = msg.user || { name: "Unknown", profileImage: undefined };
            const isCurrentUser = msgUser._id === user?._id;

            return (
              <ChatMessageComp
                key={msg.id}
                username={isCurrentUser ? "You" : msgUser.name}
                profileImage={msgUser.image}
                message={msg.message}
                time={new Date(msg.createdAt).toLocaleTimeString()}
              />
            );
          })
        ) : (
          <div className="text-gray-400 text-center mt-4">Start chatting!</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
