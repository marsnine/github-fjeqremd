import React from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();
  navigate('/');
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">인증 처리 중...</p>
      </div>
    </div>
  );
}