"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  postChat,
  ChatSource,
  recommendSeniors,
  ChatResponse,
} from "@/lib/api/apis";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const coffeeColors = {
  background: "#f9f6f2",
  chatBubbleUser: "#c7a17a",
  chatBubbleOther: "#ede0d4",
  text: "#4e342e",
  accent: "#a67c52",
  border: "#e0d6c3",
};

interface Senior {
  id: string;
  name: string;
  nickname: string;
  sex?: number;
  age?: number;
  email: string;
}

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

type SeniorMessage = {
  id: number;
  user: "other";
  text: string;
  sources?: ChatSource[];
  seniors: Senior[];
};

const personaList = [
  { key: "default", label: "기본" },
  { key: "친절한", label: "친절한" },
  { key: "직설적인", label: "직설적인" },
  { key: "냉정한", label: "냉정한" },
  { key: "밝은", label: "밝은" },
  { key: "멘토다운", label: "멘토다운" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: "other", text: "안녕하세요! 커피챗에 오신 걸 환영해요 ☕️" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [persona, setPersona] = useState<string>("default");
  const router = useRouter();

  const handleRecommendMentor = async () => {
    const lastUserMsg = [...messages]
      .reverse()
      .find((msg) => msg.user === "me");
    if (!lastUserMsg) {
      toast.error("먼저 질문을 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      // 실제 멘토 추천 API 호출
      const res = await recommendSeniors({ query: lastUserMsg.text });
      if (res.seniors && res.seniors.length > 0) {
        setMessages((msgs) => [
          ...msgs,
          {
            id: msgs.length + 1,
            user: "other",
            text: "", // text 대신 카드 렌더링용 데이터
            sources: undefined,
            seniors: res.seniors, // 커스텀 필드로 멘토 리스트 전달
          } as any, // 타입 확장
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          {
            id: msgs.length + 1,
            user: "other",
            text: `추천 가능한 멘토가 없습니다.`,
          },
        ]);
      }
    } catch (e) {
      toast.error("멘토 추천에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    try {
      const res: ChatResponse = await postChat({
        user_id: "de9fed38-311b-4def-ba7e-c9a19064f606",
        text: userMsg.text,
        persona: persona,
      });
      console.log("Chat response:", res);
      const botMsg: Message = {
        id: userMsg.id + 1,
        user: "other",
        text: res.text,
        sources: res.sources,
      };
      setMessages((msgs) => [...msgs, botMsg]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: userMsg.id + 1,
          user: "other",
          text: "답변을 가져오지 못했습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f7efe2]"
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundImage:
          "url('/beige-paper.png'), linear-gradient(to bottom right, #f9f6f2, #f7efe2)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <div
        className="w-full max-w-xl flex flex-col rounded-2xl shadow-lg border border-gray-200 bg-white"
        style={{ minHeight: 600, height: "80vh" }}
      >
        <div className="w-full px-6 pt-2 pb-2 flex gap-2">
          {personaList.map((p) => (
            <Button
              key={p.key}
              type="button"
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                persona === p.key
                  ? "bg-[#c7a17a] text-white border-[#c7a17a]"
                  : "bg-[#f9f6f2] text-[#a67c52] border-[#e0d6c3]"
              }`}
              onClick={() => setPersona(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
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
                  className={`shadow-none border-0 py-2 ${
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
                    {/* 멘토 추천 메시지라면 카드로 멘토 리스트 렌더링 */}
                    {msg.user === "other" && (msg as any).seniors ? (
                      <div className="flex flex-col gap-3">
                        {(msg as SeniorMessage).seniors.map(
                          (s: Senior, i: number) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between bg-[#f7efe2] border border-[#e0d6c3] rounded-lg px-4 py-3"
                            >
                              <div>
                                <div className="font-semibold text-[#a67c52]">
                                  {s.name}{" "}
                                  <span className="text-xs text-gray-500">
                                    (@{s.nickname})
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {typeof s.sex === "number"
                                    ? s.sex === 0
                                      ? "여자"
                                      : "남자"
                                    : ""}
                                  {s.age ? ` · ${s.age}세` : ""}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {s.email}
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  router.push(`/profile/${s.id}`);
                                }}
                                className="ml-4 px-3 py-1 bg-[#c7a17a] text-white rounded-md text-xs font-semibold hover:bg-[#a98467] transition"
                              >
                                프로필 보기
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <>
                        {msg.text.split("\n").map((line, idx) => (
                          <React.Fragment key={idx}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                        {msg.user === "other" &&
                          msg.sources &&
                          msg.sources.length > 0 && (
                            <div className="mt-3 bg-[#f5efe6] rounded-lg p-3 text-xs text-[#7c5c3e] border border-[#e0d6c3]">
                              <div className="font-semibold mb-1">
                                🔗 답변에 참고된 프로필
                              </div>
                              <ul className="pl-3">
                                {msg.sources.map((src, idx) => (
                                  <li key={idx} className="mb-2">
                                    <div className="ml-2 text-xs text-gray-700">
                                      <span className="font-semibold">
                                        이름:
                                      </span>{" "}
                                      {src.user_data.name}{" "}
                                      <span className="text-gray-500">
                                        (@{src.user_data.nickname})
                                      </span>
                                      {typeof src.user_data.sex ===
                                        "number" && (
                                        <span className="ml-2">
                                          /{" "}
                                          {src.user_data.sex === 0
                                            ? "여자"
                                            : src.user_data.sex === 1
                                            ? "남자"
                                            : "기타"}
                                        </span>
                                      )}
                                      {src.user_data.age && (
                                        <span className="ml-2">
                                          {src.user_data.age}세
                                        </span>
                                      )}
                                    </div>
                                    <div className="ml-2 text-xs text-gray-500">
                                      <span className="font-semibold">
                                        이메일:
                                      </span>{" "}
                                      {src.user_data.email}
                                    </div>
                                    <div className="ml-2 text-xs text-gray-500">
                                      <span className="font-semibold">
                                        관련도:
                                      </span>{" "}
                                      {src.relevance_score}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </>
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
        {/* 멘토 추천 버튼 */}
        <div className="w-full px-6 pb-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-[#c7a17a] text-[#a67c52] font-semibold rounded-lg shadow-none hover:bg-[#f7efe2] transition"
            onClick={handleRecommendMentor}
          >
            멘토 추천받기
          </Button>
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
