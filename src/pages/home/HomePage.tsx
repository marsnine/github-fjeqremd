import React from 'react';
import { VideoView } from '../../components/VideoView';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.user_metadata?.level === 'admin';
  const isUploader = user?.user_metadata?.level === 'uploader' || isAdmin;

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const handleUploaderClick = () => {
    if (isUploader) {
      navigate('/uploader');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <VideoView
      isAdmin={isAdmin}
      isUploader={isUploader}
      onAdminClick={handleAdminClick}
      onUploaderClick={handleUploaderClick}
      onProfileClick={handleProfileClick}
    />
  );
}