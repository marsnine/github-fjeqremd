import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface YouTubePlayerProps {
  videoUrl: string;
}

export function YouTubePlayer({ videoUrl }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // YouTube Shorts URL 처리
      if (urlObj.pathname.includes('/shorts/')) {
        const shortsId = urlObj.pathname.split('/shorts/')[1];
        console.log('Shorts ID:', shortsId);
        return shortsId;
      }
      
      // 일반적인 YouTube URL 처리
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      
      const videoId = urlObj.searchParams.get('v');
      console.log('Video ID from URL:', videoId);
      return videoId;
      
    } catch (error) {
      console.error('Error parsing YouTube URL:', url, error);
      return null;
    }
  };

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    console.error('Invalid YouTube URL:', videoUrl);
    return <div>Invalid YouTube URL</div>;
  }

  // 모든 동영상을 일반 플레이어로 재생
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
