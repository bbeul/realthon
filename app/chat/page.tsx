"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { postChat, ChatSource } from "@/lib/api/apis";

const coffeeColors = {
  background: "#f9f6f2",
  chatBubbleUser: "#c7a17a",
  chatBubbleOther: "#ede0d4",
  text: "#4e342e",
  accent: "#a67c52",
  border: "#e0d6c3",
};

type Message =
  | {
      id: number;
      user: "me";
      text: string;
    }
  | {
      id: number;
      user: "other";
      text: string;
      sources?: ChatSource[];
    };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: "other", text: "안녕하세요! 커피챗에 오신 걸 환영해요 ☕️" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDummyResponse = (query: string) => {
    return {
      text: `질문 "${query}"에 대한 더미 답변입니다.`,
      sources: [
        {
          profile_id: "uuid-1234",
          user_id: "uuid-mentor-1",
          relevance_score: 0.87,
          temperature: 0.92,
        },
        {
          profile_id: "uuid-5678",
          user_id: "uuid-mentor-2",
          relevance_score: 0.75,
          temperature: 0.68,
        },
      ],
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = {
      id: messages.length + 1,
      user: "me",
      text: input,
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const res = getDummyResponse(userMsg.text);
      const botMsg: Message = {
        id: userMsg.id + 1,
        user: "other",
        text: res.text,
        sources: res.sources,
      };
      setMessages((msgs) => [...msgs, botMsg]);
      setLoading(false);
    }, 800);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f7efe2]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div
        className="w-full max-w-xl flex flex-col rounded-2xl shadow-lg border border-gray-200 bg-white"
        style={{ minHeight: 600, height: "80vh" }}
      >
        <div
          className="flex-1 overflow-y-auto px-6 py-8"
          style={{ minHeight: 400 }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-3 ${
                msg.user === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                <Card
                  className={`shadow-none border-0 ${
                    msg.user === "me"
                      ? "bg-[#c7a17a] text-white rounded-2xl rounded-br-md"
                      : "bg-[#ede0d4] text-brown-700 rounded-2xl rounded-bl-md"
                  }`}
                  style={{
                    minWidth: 60,
                    maxWidth: "100%",
                  }}
                >
                  <CardContent className="py-3 px-5 text-base break-words">
                    {msg.text}
                    {msg.user === "other" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <div className="mt-3 bg-[#f5efe6] rounded-lg p-3 text-xs text-[#7c5c3e] border border-[#e0d6c3]">
                          <div className="font-semibold mb-1">
                            🔗 답변에 참고된 프로필
                          </div>
                          <ul className="pl-3">
                            {msg.sources.map((src, idx) => (
                              <li key={idx} className="mb-1">
                                <span className="font-medium">
                                  프로필ID: {src.profile_id}
                                </span>
                                <span className="ml-2 text-[11px]">
                                  (유저: {src.user_id}, 관련도:{" "}
                                  {src.relevance_score}, 다양성:{" "}
                                  {src.temperature})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-[#a67c52] text-sm opacity-70 mt-2">
              <span
                className="inline-block"
                style={{
                  width: 16,
                  height: 16,
                  border: "2.5px solid #e0c9b2",
                  borderTop: "2.5px solid #c7a17a",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              답변 생성 중...
              <style>
                {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
              </style>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* 입력창 고정 */}
        <div className="w-full border-t border-gray-200 bg-[#f9f6f2] rounded-b-2xl px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-white rounded-lg border border-gray-200 px-4 py-3 text-base outline-none"
            disabled={loading}
            aria-label="메시지 입력"
            autoFocus
          />
          <Button
            onClick={handleSend}
            className="bg-[#c7a17a] text-white rounded-lg font-semibold text-base min-w-[80px] h-11 shadow-sm transition disabled:opacity-60"
            disabled={loading || !input.trim()}
            aria-label="메시지 보내기"
          >
            보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
