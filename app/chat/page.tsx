"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { postChat, ChatResponse, ChatSource } from "@/lib/api/apis";

const coffeeColors = {
  background: "#f8f5f1",
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
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: coffeeColors.background,
        fontFamily: "Pretendard, sans-serif",
        color: coffeeColors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 상단 고정 헤더 */}
      <header
        style={{
          width: "100%",
          maxWidth: 640,
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fffaf3cc",
          borderBottom: `1.5px solid ${coffeeColors.border}`,
          zIndex: 10,
          padding: "0 0 0 0",
          display: "flex",
          alignItems: "center",
          height: 64,
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: -1,
          boxShadow: "0 2px 8px 0 rgba(200,160,120,0.04)",
          backdropFilter: "blur(2px)",
        }}
      >
        <span style={{ color: coffeeColors.accent }}>☕️ LatteChat</span>
      </header>

      {/* 채팅 영역 */}
      <main
        style={{
          width: "100%",
          maxWidth: 640,
          flex: 1,
          marginTop: 80,
          marginBottom: 96,
          display: "flex",
          flexDirection: "column",
          background: "#fffaf3",
          borderRadius: 24,
          border: `1.5px solid ${coffeeColors.border}`,
          boxShadow: "0 4px 32px 0 rgba(200,160,120,0.10)",
          minHeight: "60vh",
          overflow: "hidden",
        }}
      >
        <CardContent
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem 1.2rem 1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            background: "transparent",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.user === "me" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                marginBottom: 2,
                display: "flex",
                flexDirection: msg.user === "me" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              {/* 프로필 아바타 */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    msg.user === "me"
                      ? coffeeColors.chatBubbleUser
                      : coffeeColors.chatBubbleOther,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  color: msg.user === "me" ? "#fff" : coffeeColors.accent,
                  boxShadow:
                    msg.user === "me"
                      ? "0 2px 8px rgba(200,160,120,0.10)"
                      : "none",
                  border:
                    msg.user === "me"
                      ? "none"
                      : `1.5px solid ${coffeeColors.border}`,
                }}
                aria-label={msg.user === "me" ? "나" : "챗봇"}
              >
                {msg.user === "me" ? "나" : "AI"}
              </div>
              <Card
                style={{
                  background:
                    msg.user === "me"
                      ? coffeeColors.chatBubbleUser
                      : coffeeColors.chatBubbleOther,
                  color: coffeeColors.text,
                  borderRadius:
                    msg.user === "me"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  boxShadow: "0 2px 8px rgba(200,160,120,0.07)",
                  border: "none",
                  minWidth: 60,
                  padding: 0,
                  margin: 0,
                }}
              >
                <CardContent
                  style={{
                    padding: "13px 20px",
                    fontSize: 16,
                    wordBreak: "break-word",
                    background: "transparent",
                    lineHeight: 1.7,
                  }}
                >
                  {msg.text}
                  {msg.user === "other" &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          background: "#f5efe6",
                          borderRadius: 10,
                          padding: "10px",
                          fontSize: 13,
                          color: "#7c5c3e",
                          border: `1px solid ${coffeeColors.border}`,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          🔗 답변에 참고된 프로필
                        </div>
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {msg.sources.map((src, idx) => (
                            <li key={idx} style={{ marginBottom: 2 }}>
                              <span style={{ fontWeight: 500 }}>
                                프로필ID: {src.profile_id}
                              </span>
                              <span style={{ marginLeft: 8, fontSize: 12 }}>
                                (유저: {src.user_id}, 관련도:{" "}
                                {src.relevance_score}, 다양성: {src.temperature}
                                )
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          ))}
          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                margin: "8px 0 0 44px",
                color: coffeeColors.accent,
                fontSize: 15,
                opacity: 0.7,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: "2.5px solid #e0c9b2",
                  borderTop: "2.5px solid #c7a17a",
                  borderRadius: "50%",
                  display: "inline-block",
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
        </CardContent>
      </main>

      {/* 입력창 고정 */}
      <footer
        style={{
          width: "100%",
          maxWidth: 640,
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          background: "#fffaf3",
          borderTop: `1.5px solid ${coffeeColors.border}`,
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 -2px 8px rgba(200,160,120,0.04)",
          padding: "0 0 0 0",
          zIndex: 10,
        }}
      >
        <CardContent
          style={{
            padding: "1rem 1.2rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
          }}
        >
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 8,
              fontSize: 16,
              border: `1.5px solid ${coffeeColors.border}`,
              padding: "12px 16px",
              outline: "none",
            }}
            disabled={loading}
            aria-label="메시지 입력"
            autoFocus
          />
          <Button
            onClick={handleSend}
            style={{
              background: coffeeColors.chatBubbleUser,
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              minWidth: 80,
              height: 44,
              boxShadow: "0 2px 8px rgba(200,160,120,0.07)",
              transition: "background 0.2s",
              opacity: loading || !input.trim() ? 0.6 : 1,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
            disabled={loading || !input.trim()}
            aria-label="메시지 보내기"
          >
            보내기
          </Button>
        </CardContent>
      </footer>
    </div>
  );
}
