import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.user_metadata?.level === 'admin';
  const isUploader = user?.user_metadata?.level === 'uploader' || isAdmin;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* 로고 */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                줄여줘경매
              </h1>
            </div>

            {/* 네비게이션 */}
            <nav className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      관리자
                    </button>
                  )}
                  {isUploader && (
                    <button
                      onClick={() => navigate('/uploader')}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      업로더
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    프로필
                  </button>
                </>
              )}
            </nav>

            {/* 사용자 정보 */}
            {isAuthenticated && (
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {isAdmin ? '관리자' : (isUploader ? '업로더' : '사용자')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user?.email}
                  </span>
                </div>
                <div className="ml-4 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 줄여줘경매. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}