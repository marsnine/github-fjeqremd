import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VideoNavigation } from './VideoNavigation';
import { YouTubePlayer } from './YouTubePlayer';
import { PlayerProvider } from '../context/PlayerContext';

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
  console.log('Video URL:', video.video_url, 'Is YouTube:', isYouTube);
  
  const videoUrl = isYouTube
    ? video.video_url
    : supabase.storage.from('videos').getPublicUrl(video.video_url).data.publicUrl;

  return (
    <div className="relative h-screen snap-start bg-white dark:bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-screen-xl mx-auto flex">
        {/* Video Container */}
        <div className="relative w-full h-full">
          {isYouTube ? (
            <YouTubePlayer videoUrl={videoUrl} />
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              className="h-full w-full object-contain"
              playsInline
              muted={isMuted}
              loop
            />
          )}
        </div>

        {/* Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">{video.title}</h2>
                <p className="text-sm opacity-90">{video.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm opacity-75">{video.profiles.username}</span>
                  <span className="text-sm opacity-75">•</span>
                  <span className="text-sm opacity-75">{formatDate(video.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1">
                  <Heart className="w-6 h-6" />
                  <span>{formatNumber(video.likes)}</span>
                </button>
                <button className="flex items-center space-x-1">
                  <MessageCircle className="w-6 h-6" />
                  <span>27</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button>
                  <Bookmark className="w-6 h-6" />
                </button>
                <button>
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
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

      if (error) {
        console.error('Error fetching videos:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return;
      }

      if (data) {
        console.log('Fetched videos:', JSON.stringify(data, null, 2));
        setVideos(data);
      } else {
        console.log('No videos found');
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
