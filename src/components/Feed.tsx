import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Play, Volume2, VolumeX, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VideoNavigation } from './VideoNavigation';
import { YouTubePlayer } from './YouTubePlayer';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';

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

function isYouTubeUrl(url: string) {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function VideoPlayer({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
      videoRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

  const isYouTube = isYouTubeUrl(video.video_url);
  const videoUrl = isYouTube
    ? video.video_url
    : supabase.storage.from('videos').getPublicUrl(video.video_url).data.publicUrl;

  return (
    <div className="relative h-screen snap-start bg-white dark:bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-screen-xl mx-auto flex">
        {/* Video Container */}
        <div className="relative w-full md:w-[calc(100%-400px)] h-full">
          {isYouTube ? (
            <YouTubePlayer videoUrl={videoUrl} videoId={video.id} />
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={videoUrl}
                className="h-full w-full object-contain"
                playsInline
                muted={isMuted}
                onClick={togglePlayPause}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={togglePlayPause}
                >
                  <div className="bg-gray-500/30 dark:bg-black/30 rounded-full p-4">
                    <Play className="w-12 h-12 text-gray-700 dark:text-white" />
                  </div>
                </div>
              )}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 left-4 z-10 bg-gray-500/30 dark:bg-black/30 p-2 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-gray-700 dark:text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-gray-700 dark:text-white" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info Section - Only visible on MD and larger screens */}
        <div className="hidden md:flex flex-col w-[400px] bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.profiles.username}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{video.profiles.username}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(video.created_at)}</p>
              </div>
              <button className="ml-auto bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                팔로우
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{video.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{video.description}</p>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white">{formatNumber(video.likes)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white">27</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bookmark className="w-6 h-6 text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white">89</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="w-6 h-6 text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white">61</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>조회수 {formatNumber(video.views)}회</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Feed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVideos(data);
      }
    };

    fetchVideos();
  }, []);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const element = document.getElementById(`video-${currentIndex - 1}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const element = document.getElementById(`video-${currentIndex + 1}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <VideoNavigation
        onPrevious={handlePrevious}
        onNext={handleNext}
        showPrevious={currentIndex > 0}
        showNext={currentIndex < videos.length - 1}
      />
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {videos.map((video, index) => (
          <div key={video.id} id={`video-${index}`}>
            <VideoPlayer video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}
