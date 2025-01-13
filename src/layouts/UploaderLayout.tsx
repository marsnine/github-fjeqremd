import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Video } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { YouTubeTranscriptTest } from '../components/uploader/YouTubeTranscriptTest';

export function UploaderLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.user_metadata?.level === 'admin';
  const currentPath = location.pathname.split('/').pop() || '';

  const handleExitUploader = () => {
    navigate('/');
  };

  const menuItems = [
    { path: 'videos', label: '비디오 관리', icon: Video },
    { path: 'youtube', label: '유튜브 재생목록', icon: Video },
    { path: 'youtube-videos', label: '유튜브 동영상', icon: Video },
    { path: 'unit-test', label: '단위 테스트', icon: Video },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">줄여줘경매</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {isAdmin ? '관리자' : '업로더'}
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
                {menuItems.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <Link
                      to={`/uploader/${path}`}
                      className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                        currentPath === path ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleExitUploader}
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
            <Outlet />
            {currentPath === 'unit-test' && <YouTubeTranscriptTest />}
          </div>
        </div>
      </div>
    </div>
  );
}