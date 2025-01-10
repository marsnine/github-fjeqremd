import React, { useState, useRef } from 'react';
import { X, Upload as UploadIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size <= 100 * 1024 * 1024) { // 100MB limit
      setFile(selectedFile);
    } else {
      setError('File size must be less than 10MB');
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regex = /^.*(youtu\.be\/|v\/|shorts\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regex);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchYoutubeVideoInfo = async (videoId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const videoInfo = data.items[0].snippet;
        setTitle(videoInfo.title);
        setDescription(videoInfo.description);
      }
    } catch (error) {
      console.error('Error fetching YouTube video info:', error);
      setError('Failed to fetch video information');
    }
  };

  const validateYoutubeUrl = (url: string) => {
    const videoId = getYoutubeVideoId(url);
    return videoId !== null;
  };

  const handleYoutubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    if (validateYoutubeUrl(url)) {
      const videoId = getYoutubeVideoId(url);
      if (videoId) {
        await fetchYoutubeVideoInfo(videoId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (uploadType === 'file' && !file) || (uploadType === 'youtube' && !youtubeUrl)) return;

    setUploading(true);
    setError('');

    try {
      let videoUrl = '';

      if (uploadType === 'file' && file) {
        // Upload video to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('videos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        videoUrl = data.path;
      } else if (uploadType === 'youtube' && youtubeUrl) {
        if (!validateYoutubeUrl(youtubeUrl)) {
          throw new Error('Invalid YouTube URL');
        }
        videoUrl = youtubeUrl;
      }

      // Create video record
      const { error: dbError } = await supabase
        .from('videos')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            video_url: videoUrl
          }
        ]);

      if (dbError) throw dbError;

      onClose();
      setFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Upload Video</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setUploadType('file');
                setYoutubeUrl('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg ${
                uploadType === 'file'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadType('youtube');
                setFile(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg ${
                uploadType === 'youtube'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              YouTube URL
            </button>
          </div>

          {uploadType === 'file' ? (
            <>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-500 text-sm hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer space-y-2"
                  >
                    <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-300">Click to upload video</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maximum file size: 50MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  required={uploadType === 'youtube'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              uploading ||
              (uploadType === 'file' && !file) ||
              (uploadType === 'youtube' && !youtubeUrl)
            }
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
