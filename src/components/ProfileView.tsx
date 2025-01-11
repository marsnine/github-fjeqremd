import React, { useState, useEffect } from 'react';
import { Settings, Grid } from 'lucide-react';
import { ProfileEdit } from './ProfileEdit';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileData {
  id: string;
  username: string;
  avatar_url?: string;
  user_level: 'admin' | 'uploader' | 'viewer';
  created_at: string;
  updated_at?: string;
}

export function ProfileView() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('프로필 정보 조회 중 오류 발생:', error);
      setError('프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 프로필 정보 로드
  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 dark:text-gray-400">프로필 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 dark:text-gray-400">프로필 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <div className="flex items-start space-x-6 mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile.username}
                </h1>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile.user_level.charAt(0).toUpperCase() + profile.user_level.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    가입일: {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>프로필 편집</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
          <nav className="flex space-x-8">
            <button className="px-1 py-4 text-gray-900 dark:text-white border-b-2 border-blue-500 font-medium flex items-center space-x-2">
              <Grid className="w-5 h-5" />
              <span>기록</span>
            </button>
          </nav>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">동영상이 여기에 표시됩니다.</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">프로필 편집</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <ProfileEdit 
              onClose={() => setShowEditModal(false)} 
              onUpdate={fetchProfile}
            />
          </div>
        </div>
      )}
    </>
  );
}
