import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { PlayerProvider } from './context/PlayerContext';
import { Search, Upload, Bell, User } from 'lucide-react';

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">삼분홈즈</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="검색"
              className="w-full h-10 px-4 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </button>
          
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              9
            </span>
          </button>

          <button className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen bg-white dark:bg-black transition-colors">
        <Header />
        <div className="max-w-7xl mx-auto flex bg-white dark:bg-black pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64">
            <Feed />
          </main>
        </div>
      </div>
    </PlayerProvider>
  );
}

export default App;
