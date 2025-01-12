import React, { useState } from 'react';
import { Home, Video } from 'lucide-react';
import { UploaderVideoManagement } from './VideoManagement';
import { YouTubePlaylistManagement } from './YouTubePlaylistManagement';
import { YouTubeVideoManagement } from './YouTubeVideoManagement';
import { useAuth } from '../../context/AuthContext';

interface UploaderLayoutProps {
  onExitUploader: () => void;
}

export function UploaderLayout({ onExitUploader }: UploaderLayoutProps) {
  const [currentView, setCurrentView] = useState<'videos' | 'youtube' | 'youtube-videos'>('videos');
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">줄여줘경매</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {user?.user_metadata?.level === 'admin' ? '관리자' : '업로더'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 사이드바 */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">업로더 콘솔</h2>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentView('videos')}
                    className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                      currentView === 'videos' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    비디오 관리
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('youtube')}
                    className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                      currentView === 'youtube' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    유튜브 재생목록
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('youtube-videos')}
                    className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                      currentView === 'youtube-videos' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    유튜브 동영상
                  </button>
                </li>
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onExitUploader}
                className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Home className="w-5 h-5 mr-2" />
                사용자 메뉴
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {currentView === 'videos' && <UploaderVideoManagement />}
            {currentView === 'youtube' && <YouTubePlaylistManagement />}
            {currentView === 'youtube-videos' && <YouTubeVideoManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}