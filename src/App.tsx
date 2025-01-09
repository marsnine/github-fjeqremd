import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';

function App() {
  return (
    <div className="min-h-screen bg-black transition-colors">
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <Feed />
        </main>
      </div>
    </div>
  );
}

export default App;