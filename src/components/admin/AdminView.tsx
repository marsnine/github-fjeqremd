import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { UserManagement } from './UserManagement';
import { VideoManagement } from './VideoManagement';
import { ChannelManagement } from './ChannelManagement';

interface AdminViewProps {
  onExitAdmin: () => void;
}

export function AdminView({ onExitAdmin }: AdminViewProps) {
  const [currentView, setCurrentView] = useState<'users' | 'videos' | 'channels'>('users');

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement />;
      case 'videos':
        return <VideoManagement />;
      case 'channels':
        return <ChannelManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onExitAdmin={onExitAdmin}
    >
      {renderContent()}
    </AdminLayout>
  );
}