import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProfileEdit } from '../../components/ProfileEdit';

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.user_metadata?.username || '사용자'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {user?.user_metadata?.level === 'admin'
                ? '관리자'
                : user?.user_metadata?.level === 'uploader'
                ? '업로더'
                : '사용자'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              프로필 수정
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <ProfileEdit onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}