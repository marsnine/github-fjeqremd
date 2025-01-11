import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VideoPlayer } from './VideoPlayer';

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

export function VideoView() {
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
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">동영상을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-800/90 backdrop-blur-sm transition-all ${
          currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === videos.length - 1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-800/90 backdrop-blur-sm transition-all ${
          currentIndex === videos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Current Video */}
      <VideoPlayer video={videos[currentIndex]} />
    </div>
  );
}
