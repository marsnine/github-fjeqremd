import React from 'react';
import { Home, User, Settings, Video } from 'lucide-react';

interface BottomNavProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
  onUploaderClick?: () => void;
  isAdmin?: boolean;
  isUploader?: boolean;
}

export function BottomNav({ 
  onHomeClick, 
  onProfileClick, 
  onAdminClick, 
  onUploaderClick, 
  isAdmin, 
  isUploader 
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={onHomeClick}
          className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">홈</span>
        </button>

        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">프로필</span>
        </button>

        {isAdmin && onAdminClick && (
          <button
            onClick={onAdminClick}
            className="flex flex-col items-center justify-center w-full h-full text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">관리자</span>
          </button>
        )}

        {isUploader && onUploaderClick && (
          <button
            onClick={onUploaderClick}
            className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs mt-1">업로더</span>
          </button>
        )}
      </div>
    </nav>
  );
}
