import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileEditProps {
  onClose: () => void;
  onUpdate?: () => void;
}

export function ProfileEdit({ onClose, onUpdate }: ProfileEditProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error('프로필 정보 조회 중 오류 발생:', error);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 프로필 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
      
      // 부모 컴포넌트에 업데이트 알림
      if (onUpdate) {
        onUpdate();
      }

      // 성공 메시지를 보여준 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">프로필 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {/* 사용자 이름 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            사용자 이름
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            minLength={2}
            maxLength={50}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            다른 사용자들에게 표시될 이름입니다.
          </p>
        </div>

        {/* 프로필 이미지 업로드 (향후 구현) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            프로필 이미지
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => alert('이미지 업로드 기능은 곧 제공될 예정입니다.')}
            >
              변경
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            JPG, PNG, GIF 파일을 업로드할 수 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="text-green-500 text-sm">
            {successMessage}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
