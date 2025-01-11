import React, { useState } from 'react';
import { Home, Video } from 'lucide-react';
import { UploaderVideoManagement } from './VideoManagement';
import { YouTubePlaylistManagement } from './YouTubePlaylistManagement';
import { YouTubeVideoManagement } from './YouTubeVideoManagement';

interface UploaderLayoutProps {
  onExitUploader: () => void;
}

export function UploaderLayout({ onExitUploader }: UploaderLayoutProps) {
  const [currentView, setCurrentView] = useState<'videos' | 'youtube' | 'youtube-videos'>('videos');

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
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
  );
}