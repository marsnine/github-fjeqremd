import React, { useState, useEffect } from 'react';
import { ExternalLink, Edit2, Trash2, Plus, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AddVideoToLibraryModal } from './AddVideoToLibraryModal';

interface ExternalVideo {
  id: string;
  playlist_id: string;
  video_link: string;
  title: string;
  description: string;
  origin_update: string;
  target_update: string;
}

interface ExternalPlaylist {
  id: string;
  list_name: string;
}

const ITEMS_PER_PAGE = 50;

export function YouTubeVideoManagement() {
  const [videos, setVideos] = useState<ExternalVideo[]>([]);
  const [playlists, setPlaylists] = useState<ExternalPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExternalVideo | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  // 재생목록 목록 가져오기
  const fetchPlaylists = async () => {
    try {
      if (!user) throw new Error('로그인이 필요합니다');

      const { data, error } = await supabase
        .from('external_playlists')
        .select('id, list_name')
        .eq('user_id', user.id)
        .order('list_name');

      if (error) throw error;

      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(data[0].id);
      }
    } catch (error) {
      console.error('재생목록 조회 중 오류:', error);
      setError('재생목록을 불러오는데 실패했습니다.');
    }
  };

  // 선택된 재생목록의 동영상 목록 가져오기
  const fetchVideos = async (isLoadingMore = false) => {
    if (!selectedPlaylistId) return;

    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(0);
        setVideos([]);
        setHasMore(true);
      }

      const { data, error } = await supabase
        .from('external_videos')
        .select('*')
        .eq('playlist_id', selectedPlaylistId)
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
        .order('origin_update', { ascending: false });

      if (error) throw error;

      if (isLoadingMore) {
        setVideos(prev => [...prev, ...data]);
      } else {
        setVideos(data);
      }

      // 가져온 데이터가 ITEMS_PER_PAGE보다 적으면 더 이상 데이터가 없음
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('동영상 목록 조회 중 오류:', error);
      setError('동영상 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 다음 페이지 로드
  const loadMore = async () => {
    setPage(prev => prev + 1);
    await fetchVideos(true);
  };

  // 동영상 삭제
  const handleDelete = async (videoId: string) => {
    if (!confirm('정말 이 동영상을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('external_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('동영상 삭제 중 오류:', error);
      alert('동영상 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlaylistId) {
      fetchVideos();
    }
  }, [selectedPlaylistId]);

  if (loading && !videos.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">동영상 목록을 불러오는 중...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube 동영상</h2>
      </div>

      {/* 재생목록 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          재생목록 선택
        </label>
        <select
          value={selectedPlaylistId}
          onChange={(e) => setSelectedPlaylistId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.list_name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                동영상 제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                원본 업데이트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                로컬 업데이트
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
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[400px]" title={video.title}>
                    {video.title.length > 30 ? `${video.title.slice(0, 30)}...` : video.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${
                    new Date(video.origin_update).toDateString() !== new Date(video.target_update).toDateString()
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(video.origin_update).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(video.target_update).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <a
                    href={video.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-block"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedVideo(video);
                      setShowAddModal(true);
                    }}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 inline-block"
                  >
                    <Plus className="w-5 h-5" />
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

        {/* 계속 표시 버튼 */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50 flex items-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>로딩 중...</span>
                </>
              ) : (
                <span>계속 표시</span>
              )}
            </button>
          </div>
        )}
      </div>

      {showAddModal && selectedVideo && (
        <AddVideoToLibraryModal
          videoLink={selectedVideo.video_link}
          onClose={() => {
            setShowAddModal(false);
            setSelectedVideo(null);
          }}
          onSave={fetchVideos}
        />
      )}
    </div>
  );
}