import React, { useState } from 'react';
import { Heart, ThumbsDown, Bookmark, Users } from 'lucide-react';
import { YouTubePlayer } from './YouTubePlayer';
import { AIChatbot } from './AIChatbot';

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  views: number;
  likes: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-full bg-white dark:bg-black">
      {/* 왼쪽 섹션 - 비디오 플레이어와 정보 */}
      <div className="flex-grow overflow-y-auto">
        {/* 비디오 플레이어 */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
          <YouTubePlayer videoUrl={video.video_url} />
        </div>

        {/* 비디오 정보 */}
        <div className="p-4 space-y-4">
          {/* 업로더 정보 및 액션 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.profiles.username}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {video.profiles.username}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>구독자 1.2K</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Heart className="w-5 h-5" />
                <span>{formatNumber(video.likes)}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <ThumbsDown className="w-5 h-5" />
                <span>0</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Bookmark className="w-5 h-5" />
                <span>저장</span>
              </button>
            </div>
          </div>

          {/* 비디오 설명 */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 after:content-['...'] after:inline-block">
              {video.title}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              조회수 {formatNumber(video.views)}회 • {formatDate(video.created_at)}
            </div>
            <div className="relative">
              <p className={`text-gray-700 dark:text-gray-300 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                {video.description}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isExpanded ? '간략히' : '더보기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 섹션 - AI 챗봇 */}
      <div className="w-1/3 min-w-[300px] border-l border-gray-200 dark:border-gray-700 flex">
        <div className="flex-1 flex">
          <AIChatbot />
        </div>
      </div>
    </div>
  );
}
