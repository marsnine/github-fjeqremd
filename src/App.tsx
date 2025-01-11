import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { VideoView } from './components/VideoView';
import { ProfileView } from './components/ProfileView';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Search, Upload, Bell, LogIn, Video } from 'lucide-react';
import { ProfileMenu } from './components/ProfileMenu';
import { AuthModal } from './components/AuthModal';
import { AdminView } from './components/admin/AdminView';
import { UploaderLayout } from './components/uploader/UploaderLayout';
import { UploaderVideoManagement } from './components/uploader/VideoManagement';
import { UploaderChannelManagement } from './components/uploader/ChannelManagement';
import { supabase } from './lib/supabase';

interface HeaderProps {
  onProfileClick: () => void;
  onAdminClick?: () => void;
  onUploaderClick?: () => void;
  isAdmin: boolean;
  isUploader: boolean;
}

function Header({ onProfileClick, onAdminClick, onUploaderClick, isAdmin, isUploader }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">줄여줘경매</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-2xl mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="검색"
              className="w-full h-10 px-4 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
                <Upload className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">만들기</span>
              </button>
              
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  9
                </span>
              </button>

              {isUploader && (
                <button
                  onClick={onUploaderClick}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
                >
                  <Video className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">업로더</span>
                </button>
              )}

              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {showProfileMenu && (
                  <ProfileMenu 
                    onClose={() => setShowProfileMenu(false)}
                    onProfileClick={onProfileClick}
                  />
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              <LogIn className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">로그인</span>
            </button>
          )}
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </header>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<'feed' | 'profile' | 'admin' | 'uploader'>('feed');
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploader, setIsUploader] = useState(false);

  // 사용자의 권한 확인
  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setIsAdmin(false);
        setIsUploader(false);
        if (currentPage === 'admin' || currentPage === 'uploader') {
          setCurrentPage('feed');
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_level')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        const isAdminUser = data?.user_level === 'admin';
        const isUploaderUser = data?.user_level === 'uploader';
        setIsAdmin(isAdminUser);
        setIsUploader(isUploaderUser);
        
        // 권한이 없는 페이지에 있다면 피드로 이동
        if ((!isAdminUser && currentPage === 'admin') || 
            (!isUploaderUser && currentPage === 'uploader')) {
          setCurrentPage('feed');
        }
      } catch (error) {
        console.error('사용자 권한 확인 중 오류:', error);
        setIsAdmin(false);
        setIsUploader(false);
      }
    }

    checkUserRole();
  }, [user, currentPage]);

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handleHomeClick = () => {
    setCurrentPage('feed');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setCurrentPage('admin');
    }
  };

  const handleUploaderClick = () => {
    if (isUploader) {
      setCurrentPage('uploader');
    }
  };

  const handleExitAdmin = () => {
    setCurrentPage('feed');
  };

  const handleExitUploader = () => {
    setCurrentPage('feed');
  };

  // 관리자 페이지 렌더링
  if (currentPage === 'admin' && isAdmin) {
    return (
      <ThemeProvider>
        <AdminView onExitAdmin={handleExitAdmin} />
      </ThemeProvider>
    );
  }

  // 업로더 페이지 렌더링
  if (currentPage === 'uploader' && isUploader) {
    return (
      <ThemeProvider>
        <UploaderLayout onExitUploader={handleExitUploader} />
      </ThemeProvider>
    );
  }

  // 일반 사용자 페이지 렌더링
  return (
    <ThemeProvider>
      <PlayerProvider>
        <div className="flex flex-col h-screen bg-white dark:bg-black transition-colors">
          <Header 
            onProfileClick={handleProfileClick} 
            onAdminClick={handleAdminClick}
            onUploaderClick={handleUploaderClick}
            isAdmin={isAdmin}
            isUploader={isUploader}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar 
              onHomeClick={handleHomeClick} 
              onProfileClick={handleProfileClick}
              onAdminClick={handleAdminClick}
              onUploaderClick={handleUploaderClick}
              isAdmin={isAdmin}
              isUploader={isUploader}
            />
            <main className="flex-1 md:ml-64 pt-16">
              {currentPage === 'feed' ? <VideoView /> : <ProfileView />}
            </main>
          </div>
          <BottomNav 
            onHomeClick={handleHomeClick} 
            onProfileClick={handleProfileClick}
            onAdminClick={handleAdminClick}
            onUploaderClick={handleUploaderClick}
            isAdmin={isAdmin}
            isUploader={isUploader}
          />
        </div>
      </PlayerProvider>
    </ThemeProvider>
  );
}

export default function AppWithProviders() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
