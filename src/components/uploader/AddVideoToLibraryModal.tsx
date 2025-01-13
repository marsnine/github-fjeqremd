import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AddVideoToLibraryModalProps {
  videoLink: string;
  onClose: () => void;
  onSave: () => void;
}

interface VideoInfo {
  title: string;
  description: string;
  subtitle_text?: string;
}

interface ExistingVideo {
  id: string;
  title: string;
  description: string;
  subtitle_text: string | null;
}

interface SubtitleItem {
  text: string;
  start: number;
  duration: number;
}

export function AddVideoToLibraryModal({ videoLink, onClose, onSave }: AddVideoToLibraryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingVideo, setExistingVideo] = useState<ExistingVideo | null>(null);
  const { user } = useAuth();

  const [videoInfo, setVideoInfo] = useState<VideoInfo>({
    title: '',
    description: '',
    subtitle_text: '',
  });

  // 비디오 ID 추출
  const extractVideoId = (url: string): string | null => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  // 자막 가져오기
  const fetchTranscript = async (videoUrl: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('http://localhost:3001/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '자막을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setVideoInfo((prev) => ({ ...prev, subtitle_text: JSON.stringify(data) }));
    } catch (error) {
      setError(error instanceof Error ? error.message : '자막을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // YouTube API로 비디오 정보 가져오기
  const fetchYouTubeInfo = async () => {
    try {
      setError(null);
      setLoading(true);

      const videoId = extractVideoId(videoLink);
      if (!videoId) {
        throw new Error('올바른 YouTube URL이 아닙니다');
      }

      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('YouTube API 요청 실패');
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('비디오를 찾을 수 없습니다');
      }

      const snippet = data.items[0].snippet;
      setVideoInfo({
        title: snippet.title,
        description: snippet.description,
        subtitle_text: '',
      });

      // 자막 가져오기
      await fetchTranscript(videoLink);
    } catch (error) {
      setError(error instanceof Error ? error.message : '비디오 정보를 가져오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 기존 비디오 정보 확인
  const checkExistingVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, subtitle_text')
        .eq('video_url', videoLink)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // not found 에러가 아닌 경우만 처리
          throw error;
        }
      }

      if (data) {
        setExistingVideo(data);
        setVideoInfo({
          title: data.title,
          description: data.description,
          subtitle_text: data.subtitle_text || ''
        });
      }
    } catch (error) {
      console.error('기존 비디오 확인 중 오류:', error);
    }
  };

  useEffect(() => {
    checkExistingVideo();
  }, [videoLink]);

  // 비디오 추가
  const handleAdd = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!user) throw new Error('로그인이 필요합니다');

      const { error: insertError } = await supabase
        .from('videos')
        .insert([{
          user_id: user.id,
          video_url: videoLink,
          title: videoInfo.title,
          description: videoInfo.description,
          subtitle_text: videoInfo.subtitle_text || null
        }]);

      if (insertError) throw insertError;

      onSave();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '비디오 추가 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 비디오 정보 업데이트
  const handleUpdate = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!existingVideo) throw new Error('업데이트할 비디오를 찾을 수 없습니다');

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: videoInfo.title,
          description: videoInfo.description,
          subtitle_text: videoInfo.subtitle_text || null
        })
        .eq('id', existingVideo.id);

      if (updateError) throw updateError;

      onSave();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '비디오 업데이트 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 자막 데이터 파싱
  const parseSubtitles = (subtitleText: string) => {
    try {
      const subtitles = JSON.parse(subtitleText) as SubtitleItem[];
      return subtitles.map((sub, index) => (
        <div key={index} className="mb-2">
          <span className="text-sm text-gray-500">{sub.start.toFixed(2)}s - </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{sub.text}</span>
        </div>
      ));
    } catch (e) {
      return <div className="text-sm text-gray-500">자막을 파싱할 수 없습니다.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            비디오 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비디오 URL
            </label>
            <input
              type="url"
              value={videoLink}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={fetchYouTubeInfo}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
            >
              유튜브 정보
            </button>
          </div>

          <div className="flex gap-6">
            {/* YouTube 비디오 표시 */}
            {videoLink && (
              <div className="w-1/2">
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${extractVideoId(videoLink)}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* 자막 표시 */}
            <div className="w-1/2">
              <div className="aspect-video w-full relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 absolute top-0 left-0">
                  자막
                </label>
                <div className="absolute top-7 left-0 right-0 bottom-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 overflow-y-auto">
                  {videoInfo.subtitle_text ? (
                    parseSubtitles(videoInfo.subtitle_text)
                  ) : (
                    <div className="text-sm text-gray-500">자막이 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제목
            </label>
            <input
              type="text"
              value={videoInfo.title}
              onChange={(e) => setVideoInfo({ ...videoInfo, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <textarea
              value={videoInfo.description}
              onChange={(e) => setVideoInfo({ ...videoInfo, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

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
              type="button"
              onClick={handleAdd}
              disabled={loading || existingVideo !== null}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
            >
              추가
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading || existingVideo === null}
              className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md disabled:opacity-50"
            >
              갱신
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}