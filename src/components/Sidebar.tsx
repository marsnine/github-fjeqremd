import React from 'react';
import { Home, Users, Upload, Inbox, User, Settings, Video } from 'lucide-react';
import { Link } from './Link';

interface SidebarProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
  onUploaderClick?: () => void;
  isAdmin?: boolean;
  isUploader?: boolean;
}

export function Sidebar({ 
  onHomeClick, 
  onProfileClick, 
  onAdminClick, 
  onUploaderClick,
  isAdmin,
  isUploader 
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button onClick={onHomeClick} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Home className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">AI 요약</span>
            </button>
          </li>
          <li>
            <Link href="/subscriptions" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">구독</span>
            </Link>
          </li>
          <li>
            <Link href="/upload" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Upload className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">만들기</span>
            </Link>
          </li>
          <li>
            <Link href="/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Inbox className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">메시지</span>
            </Link>
          </li>
          <li>
            <button onClick={onProfileClick} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">프로필</span>
            </button>
          </li>
          {isAdmin && onAdminClick && (
            <li>
              <button onClick={onAdminClick} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">관리자</span>
              </button>
            </li>
          )}
          {isUploader && onUploaderClick && (
            <li>
              <button onClick={onUploaderClick} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">업로더</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
