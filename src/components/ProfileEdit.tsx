import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  imageUrl: string;
  user_level: 'admin' | 'uploader' | 'viewer';
}

export function ProfileEdit() {
  const [profile, setProfile] = useState<ProfileData>({
    id: 'drfuturewalker',
    name: 'Michael ByungSun Hwang',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
    user_level: 'viewer'
  });

  const [editData, setEditData] = useState(profile);

  const handleSave = () => {
    setProfile(editData);
  };

  return (
    <div className="p-6">
      <div className="flex items-start space-x-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              사용자 레벨
            </label>
            <div className="text-gray-700 dark:text-gray-300">
              {editData.user_level.charAt(0).toUpperCase() + editData.user_level.slice(1)}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              사용자 레벨은 관리자만 변경할 수 있습니다.
            </p>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              아이디
            </label>
            <input
              type="text"
              value={editData.id}
              onChange={(e) => setEditData({ ...editData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              아이디는 영문, 숫자, 밑줄 및 마침표만 포함할 수 있습니다. 아이디를 변경하면 프로필 링크도 변경됩니다.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              닉네임은 7일에 한 번만 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          저장
        </button>
      </div>
    </div>
  );
}
