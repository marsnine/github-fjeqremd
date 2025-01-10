import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface YouTubePlayerProps {
  videoUrl: string;
  videoId: string;
}

export function YouTubePlayer({ videoUrl, videoId: id }: YouTubePlayerProps) {
  const { currentPlayingId, setCurrentPlayingId } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|shorts\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!currentPlayingId || currentPlayingId === id) {
              setCurrentPlayingId(id);
            }
          } else if (currentPlayingId === id) {
            setCurrentPlayingId(null);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [id, currentPlayingId, setCurrentPlayingId]);

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&modestbranding=1&rel=0&showinfo=0${currentPlayingId === id ? '&autoplay=1' : ''}`;

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
