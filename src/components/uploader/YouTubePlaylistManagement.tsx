import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PlaylistModal } from './PlaylistModal';

interface ExternalPlaylist {
  id: string;
  list_url: string;
  list_name: string;
  video_qty: number;
  channel_url: string;
  channel_subscriber: number;
  created_at: string;
}

export function YouTubePlaylistManagement() {
  const [playlists, setPlaylists] = useState<ExternalPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<ExternalPlaylist | undefined>(undefined);
  const { user } = useAuth();

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('external_playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlaylists(data);
    } catch (error) {
      console.error('재생목록 조회 중 오류:', error);
      setError('재생목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (playlistId: string) => {
    if (!confirm('정말 이 재생목록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('external_playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      fetchPlaylists();
    } catch (error) {
      console.error('재생목록 삭제 중 오류:', error);
      alert('재생목록 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (playlist: ExternalPlaylist) => {
    setEditingPlaylist(playlist);
    setShowModal(true);
  };

  useEffect(() => {
    if (user) {
      fetchPlaylists();

      const subscription = supabase
        .channel('external_playlists_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'external_playlists'
          },
          () => {
            fetchPlaylists();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">재생목록을 불러오는 중...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube 재생목록</h2>
        <button
          onClick={() => {
            setEditingPlaylist(undefined);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          재생목록 추가
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                재생목록 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                동영상 수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                마지막 업데이트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                구독자 수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                채널 업데이트
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {playlists.map((playlist) => (
              <tr key={playlist.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[250px]" title={playlist.list_name}>
                    {playlist.list_name.length > 20 ? `${playlist.list_name.slice(0, 20)}...` : playlist.list_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {playlist.video_qty.toLocaleString()}개
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(playlist.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {playlist.channel_subscriber.toLocaleString()}명
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(playlist.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <a
                    href={playlist.list_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-block"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-block"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(playlist.id)}
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

      {showModal && (
        <PlaylistModal
          playlist={editingPlaylist}
          onClose={() => {
            setShowModal(false);
            setEditingPlaylist(undefined);
          }}
          onSave={fetchPlaylists}
        />
      )}
    </div>
  );
}