import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PlaylistModalProps {
  playlist?: ExternalPlaylist;
  onClose: () => void;
  onSave: () => void;
}

interface ExternalPlaylist {
  id: string;
  list_url: string;
  list_name: string;
  video_qty: number;
  channel_url: string;
  channel_subscriber: number;
  created_at: string;
}

interface PlaylistInfo {
  title: string;
  videoCount: number;
  lastUpdate: string;
  channelId: string;
}

interface ChannelInfo {
  url: string;
  subscriberCount: number;
  lastUpdate: string;
}

interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
}

interface UpdateStatus {
  title: { changed: boolean; value: string };
  videoCount: { changed: boolean; value: number };
  lastUpdate: { changed: boolean; value: string };
}

interface LoadingProgress {
  current: number;
  total: number;
  status: string;
}

export function PlaylistModal({ playlist, onClose, onSave }: PlaylistModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState(playlist?.list_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const { user } = useAuth();

  // YouTube 재생목록 ID 추출
  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/[&?]list=([^&]+)/i);
    return match ? match[1] : null;
  };

  // YouTube API로 재생목록 정보 가져오기
  const fetchPlaylistInfo = async (playlistId: string) => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('재생목록 정보를 가져오는데 실패했습니다');
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('재생목록을 찾을 수 없습니다');
    }

    const playlist = data.items[0];
    return {
      title: playlist.snippet.title,
      videoCount: playlist.contentDetails.itemCount,
      lastUpdate: playlist.snippet.publishedAt,
      channelId: playlist.snippet.channelId
    };
  };

  // YouTube API로 채널 정보 가져오기
  const fetchChannelInfo = async (channelId: string) => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('채널 정보를 가져오는데 실패했습니다');
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('채널을 찾을 수 없습니다');
    }

    const channel = data.items[0];
    return {
      url: `https://www.youtube.com/channel/${channelId}`,
      subscriberCount: parseInt(channel.statistics.subscriberCount),
      lastUpdate: channel.snippet.publishedAt
    };
  };

  interface YouTubePlaylistItemsResponse {
    items: Array<{
      snippet: {
        resourceId: {
          videoId: string;
        };
        title: string;
        description: string;
        publishedAt: string;
      };
    }>;
    nextPageToken?: string;
  }

  // YouTube API로 재생목록의 동영상 정보 가져오기 (페이지네이션 처리)
  const fetchPlaylistVideos = async (playlistId: string): Promise<VideoInfo[]> => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const videos: VideoInfo[] = [];
    let nextPageToken: string | undefined = undefined;
    let totalFetched = 0;

    try {
      // 먼저 재생목록 정보를 가져와서 총 동영상 수 확인
      const playlistInfo = await fetchPlaylistInfo(playlistId);
      const totalVideos = playlistInfo.videoCount;
      
      setLoadingProgress({
        current: 0,
        total: totalVideos,
        status: '동영상 정보를 가져오는 중...'
      });

      do {
        const url: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${apiKey}`;
        const response: Response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('재생목록의 동영상 정보를 가져오는데 실패했습니다');
        }

        const data: YouTubePlaylistItemsResponse = await response.json();
        
        for (const item of data.items) {
          if (item.snippet && item.snippet.resourceId) {
            videos.push({
              videoId: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              publishedAt: item.snippet.publishedAt
            });
          }
        }

        totalFetched += data.items.length;
        setLoadingProgress({
          current: totalFetched,
          total: totalVideos,
          status: `${totalFetched}/${totalVideos} 동영상 정보 로딩 중...`
        });

        nextPageToken = data.nextPageToken;

        // API 할당량 초과 방지를 위한 지연
        if (nextPageToken) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } while (nextPageToken);

      setLoadingProgress({
        current: totalFetched,
        total: totalVideos,
        status: `${totalFetched}개의 동영상 정보를 가져왔습니다`
      });

      return videos;
    } catch (error) {
      throw new Error(`동영상 정보를 가져오는 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 재생목록 URL 확인 버튼 클릭 핸들러
  const handleCheck = async () => {
    try {
      setError(null);
      setLoading(true);
      setLoadingProgress(null);

      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('올바른 YouTube 재생목록 URL이 아닙니다');
      }

      const playlist = await fetchPlaylistInfo(playlistId);
      setPlaylistInfo(playlist);

      const channel = await fetchChannelInfo(playlist.channelId);
      setChannelInfo(channel);

      // 대용량 재생목록의 경우 동영상 정보 가져오기
      if (playlist.videoCount > 50) {
        await fetchPlaylistVideos(playlistId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '정보를 가져오는데 실패했습니다');
      setPlaylistInfo(null);
      setChannelInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // 저장 버튼 클릭 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setLoading(true);

      if (!playlistInfo || !channelInfo) {
        throw new Error('재생목록 정보를 먼저 가져와주세요');
      }

      if (!user) throw new Error('로그인이 필요합니다');

      const playlistData = {
        list_url: playlistUrl.trim(),
        list_name: playlistInfo.title,
        video_qty: playlistInfo.videoCount,
        channel_url: channelInfo.url,
        channel_subscriber: channelInfo.subscriberCount
      };

      let playlistId: string;

      if (playlist) {
        // 수정
        const { error: updateError } = await supabase
          .from('external_playlists')
          .update(playlistData)
          .eq('id', playlist.id);

        if (updateError) throw updateError;
        playlistId = playlist.id;
      } else {
        // 추가
        const { data: insertedPlaylist, error: insertError } = await supabase
          .from('external_playlists')
          .insert([{
            ...playlistData,
            user_id: user.id
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!insertedPlaylist) throw new Error('재생목록 추가 실패');
        playlistId = insertedPlaylist.id;
      }

      // YouTube API로 동영상 정보 가져오기
      setLoadingProgress({
        current: 0,
        total: playlistInfo.videoCount,
        status: '동영상 정보를 가져오는 중...'
      });

      const playlistIdFromUrl = extractPlaylistId(playlistUrl);
      if (!playlistIdFromUrl) throw new Error('재생목록 ID를 찾을 수 없습니다');

      const videos = await fetchPlaylistVideos(playlistIdFromUrl);

      // 동영상 정보 저장
      setLoadingProgress({
        current: 0,
        total: videos.length,
        status: '동영상 정보를 DB에 저장하는 중...'
      });

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const { error: videoError } = await supabase
          .from('external_videos')
          .insert([{
            playlist_id: playlistId,
            video_link: `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title,
            description: video.description,
            origin_update: video.publishedAt,
            target_update: new Date().toISOString()
          }]);

        if (videoError) {
          console.error('동영상 정보 저장 중 오류:', videoError);
          continue; // 개별 동영상 저장 실패는 무시하고 계속 진행
        }

        setLoadingProgress({
          current: i + 1,
          total: videos.length,
          status: `${i + 1}/${videos.length} 동영상 정보 저장 중...`
        });
      }

      setLoadingProgress({
        current: videos.length,
        total: videos.length,
        status: `${videos.length}개의 동영상 정보가 저장되었습니다`
      });

      onSave();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '재생목록 저장 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {playlist ? '재생목록 수정' : '새 재생목록 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              재생목록 URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="YouTube 재생목록 URL을 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                확인
              </button>
            </div>
          </div>

          {loadingProgress && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
              <div className="text-sm text-blue-700 dark:text-blue-200">
                {loadingProgress.status}
              </div>
              <div className="mt-2 w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {playlistInfo && (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">재생목록 이름:</span>
                <span className="text-sm text-gray-900 dark:text-white">{playlistInfo.title}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">동영상 수:</span>
                <span className="text-sm text-gray-900 dark:text-white">{playlistInfo.videoCount}개</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">마지막 업데이트:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(playlistInfo.lastUpdate).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {channelInfo && (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">채널 URL:</span>
                <a
                  href={channelInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  {channelInfo.url}
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">구독자 수:</span>
                <span className="text-sm text-gray-900 dark:text-white">{channelInfo.subscriberCount.toLocaleString()}명</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32">채널 업데이트:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(channelInfo.lastUpdate).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || (!playlistInfo || !channelInfo)}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
            >
              {loading ? '처리 중...' : (playlist ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}