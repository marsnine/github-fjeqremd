import React from 'react';
import { Home, Inbox, Upload, User, Users } from 'lucide-react';

interface BottomNavProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
}

export function BottomNav({ onHomeClick, onProfileClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="h-full max-w-lg mx-auto px-4 flex items-center justify-between">
        <button onClick={onHomeClick} className="flex flex-col items-center space-y-1">
          <Home className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">AI 요약</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">구독</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <Upload className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">만들기</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <Inbox className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">메시지</span>
        </button>
        <button onClick={onProfileClick} className="flex flex-col items-center space-y-1">
          <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">프로필</span>
        </button>
      </div>
    </nav>
  );
}
