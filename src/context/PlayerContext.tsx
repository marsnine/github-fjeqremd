import React, { createContext, useContext, useState } from 'react';

interface PlayerContextType {
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}

const PlayerContext = createContext<PlayerContextType>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  return (
    <PlayerContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
