import React, { useState } from 'react';
import { Users, Video, Layout, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentView: 'users' | 'videos' | 'channels';
  onViewChange: (view: 'users' | 'videos' | 'channels') => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentView, onViewChange, onExitAdmin, children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 h-full fixed left-0 transition-all duration-300`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`font-bold text-gray-800 dark:text-white ${isSidebarOpen ? 'text-xl' : 'text-center text-sm'}`}>
              {isSidebarOpen ? '관리자 콘솔' : '관리'}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onViewChange('users')}
                  className={`w-full flex items-center p-2 rounded-lg ${
                    currentView === 'users'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  {isSidebarOpen && <span className="ml-3">사용자 관리</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('videos')}
                  className={`w-full flex items-center p-2 rounded-lg ${
                    currentView === 'videos'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  {isSidebarOpen && <span className="ml-3">비디오 관리</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('channels')}
                  className={`w-full flex items-center p-2 rounded-lg ${
                    currentView === 'channels'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Layout className="w-5 h-5" />
                  {isSidebarOpen && <span className="ml-3">채널 관리</span>}
                </button>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Home className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3">사용자 메뉴</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}