import React from 'react';
import { User, Wallet, LayoutGrid, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ProfileMenuProps {
  onClose: () => void;
  onProfileClick: () => void;
}

export function ProfileMenu({ onClose, onProfileClick }: ProfileMenuProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleProfileClick = () => {
    onProfileClick();
    onClose();
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('로그아웃 중 오류 발생:', error);
        // TODO: 사용자에게 오류 메시지 표시 (예: 토스트 메시지)
        return;
      }
      // 로그아웃 성공 시 메뉴 닫기
      onClose();
      // 로그아웃 후 홈페이지로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 중 예기치 않은 오류 발생:', error);
      // TODO: 사용자에게 오류 메시지 표시 (예: 토스트 메시지)
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
        <div className="py-1">
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>프로필 보기</span>
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>충전하기</span>
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>채널 관리</span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>라이트 모드</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>다크 모드</span>
              </>
            )}
          </button>

          <hr className="my-1 border-gray-200 dark:border-gray-700" />

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </>
  );
}
