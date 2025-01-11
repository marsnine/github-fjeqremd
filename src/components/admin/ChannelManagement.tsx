import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ChannelManagement() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">채널 관리</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-center min-h-[300px] text-center">
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
            <div className="text-lg text-gray-500 dark:text-gray-400">
              채널 관리 기능은 준비 중입니다.
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              다음 업데이트에서 제공될 예정입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}