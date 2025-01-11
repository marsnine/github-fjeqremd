import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 이 동영상에 대해 어떤 것이든 물어보세요.'
    }
  ]);

  const handleSubmit = async (input: string) => {
    // 사용자 메시지 추가
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    // TODO: AI 응답 구현
    // 임시 응답
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant' as const,
        content: '죄송합니다. 현재 AI 응답 기능은 개발 중입니다.'
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-white dark:bg-gray-900 rounded-lg">
      {/* 챗봇 헤더 */}
      <div className="shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 어시스턴트</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">동영상에 대해 질문해보세요</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } mb-3`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 폼 */}
      <div className="sticky bottom-0 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="질문을 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const input = (e.target as HTMLInputElement).value.trim();
                if (input) {
                  handleSubmit(input);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input')?.value.trim();
              if (input) {
                handleSubmit(input);
                if (document.querySelector('input')) {
                  (document.querySelector('input') as HTMLInputElement).value = '';
                }
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
