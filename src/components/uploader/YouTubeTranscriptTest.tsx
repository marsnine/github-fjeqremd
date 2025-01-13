import React, { useState } from 'react';

export function YouTubeTranscriptTest() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 비디오 ID 추출
  const extractVideoId = (url: string): string | null => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  // 자막 가져오기 테스트
  const handleFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult('');

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('올바른 YouTube URL이 아닙니다');
      }

      // API 호출
      const response = await fetch('http://localhost:3001/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '자막을 가져오는데 실패했습니다');
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));

    } catch (error) {
      console.error('자막 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '자막을 가져오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        YouTube 자막 단위 테스트
      </h1>

      <div className="space-y-6">
        {/* 입력 폼 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              YouTube URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !videoUrl}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
              >
                {loading ? '가져오는 중...' : '가져오기'}
              </button>
            </div>
          </div>
        </div>

        {/* 결과 표시 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              자막 내용
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}