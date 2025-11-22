"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { createQuestion } from "@/lib/api/apis";

// TODO: 실제 멘토 정보와 API 연동 필요
const mentor = {
  name: "홍길동",
  nickname: "coffee_mentor",
  email: "mentor@example.com",
};

export default function SendPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await createQuestion({
        created_by: "asdf",
        title,
        content,
      });
      toast.success("질문이 성공적으로 전송되었습니다!");
      setTitle("");
      setContent("");
    } catch (e) {
      toast.error("질문 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f7efe2]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <div>
          <div className="text-lg font-semibold mb-1">
            To: {mentor.name}{" "}
            <span className="text-sm text-gray-500">(@{mentor.nickname})</span>
          </div>
          <div className="text-xs text-gray-400">{mentor.email}</div>
        </div>
        <div>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            className="mb-2"
          />
        </div>
        <div>
          <Textarea
            placeholder="멘토에게 보낼 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "전송 중..." : "질문 보내기"}
        </Button>
      </form>
    </div>
  );
}
