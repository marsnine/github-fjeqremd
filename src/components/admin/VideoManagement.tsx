import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at?: string;
  profiles: {
    username: string;
  };
}

export function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 비디오 목록 조회
  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setVideos(data);
    } catch (error) {
      console.error('비디오 목록 조회 중 오류:', error);
      setError('비디오 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비디오 삭제
  const handleDelete = async (videoId: string) => {
    if (!confirm('정말 이 비디오를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        throw error;
      }

      // 목록 새로고침
      fetchVideos();
    } catch (error) {
      console.error('비디오 삭제 중 오류:', error);
      alert('비디오 삭제에 실패했습니다.');
    }
  };

  // 비디오 정보 업데이트
  const handleUpdate = async (videoId: string, data: Partial<Video>) => {
    try {
      // 현재 사용자 정보 확인
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 사용자의 admin 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_level')
        .eq('id', user?.id)
        .single();
      
      if (profileError) throw profileError;
      
      console.log('Current user:', { user, profile });

      // 업데이트할 데이터 준비
      const updateData = {
        title: data.title?.trim() || '',
        description: data.description?.trim() || '',
        video_url: data.video_url?.trim() || ''
      };

      console.log('Updating video:', { videoId, updateData });

      // 업데이트 시도
      const { data: result, error: updateError } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', videoId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Update successful:', result);

      // 성공 시 목록 새로고침
      fetchVideos();
      setShowEditModal(false);
    } catch (error) {
      console.error('비디오 정보 업데이트 중 오류:', error);
      alert(`비디오 정보 업데이트에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  useEffect(() => {
    fetchVideos();

    // 실시간 업데이트를 위한 구독 설정
    const subscription = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'videos'
        },
        () => {
          // 변경사항이 있을 때마다 목록 새로고침
          fetchVideos();
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">비디오 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">비디오 관리</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                업로더
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                조회수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                좋아요
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                등록일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {video.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                    {video.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {video.profiles.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {video.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {video.likes.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-block"
                  >
                    <Play className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => {
                      setEditingVideo(video);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-block"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-block"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              비디오 정보 편집
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명
                </label>
                <textarea
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비디오 URL
                </label>
                <input
                  type="url"
                  value={editingVideo.video_url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const updateData = {
                    title: editingVideo.title,
                    description: editingVideo.description,
                    video_url: editingVideo.video_url,
                    user_id: editingVideo.user_id
                  };
                  console.log('전송할 업데이트 데이터:', updateData); // 디버깅용 로그
                  handleUpdate(editingVideo.id, updateData);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}