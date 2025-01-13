import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { USER_LEVELS, AUTH_ROUTES } from '../features/auth/constants';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { UploaderLayout } from '../layouts/UploaderLayout';

// Pages
import { HomePage } from '../pages/home/HomePage';
import { ProfilePage } from '../pages/profile/ProfilePage';

// Uploader Pages
import { UploaderVideoManagement } from '../components/uploader/VideoManagement';
import { YouTubePlaylistManagement } from '../components/uploader/YouTubePlaylistManagement';
import { YouTubeVideoManagement } from '../components/uploader/YouTubeVideoManagement';
import { UnitTestView } from '../components/uploader/UnitTestView';

// Protected Route Component
const ProtectedRoute = ({ children, requiredLevel }: { children: React.ReactNode, requiredLevel?: 'admin' | 'uploader' }) => {
  const { user, isAuthenticated } = useAuth();
  const userLevel = user?.user_metadata?.level;

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.HOME} replace />;
  }

  if (requiredLevel) {
    const hasAccess = 
      requiredLevel === USER_LEVELS.ADMIN ? userLevel === USER_LEVELS.ADMIN :
      requiredLevel === USER_LEVELS.UPLOADER ? (userLevel === USER_LEVELS.UPLOADER || userLevel === USER_LEVELS.ADMIN) :
      true;

    if (!hasAccess) {
      return <Navigate to={AUTH_ROUTES.HOME} replace />;
    }
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      {/* Main Layout */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Uploader Layout */}
      <Route
        path="uploader"
        element={
          <ProtectedRoute requiredLevel={USER_LEVELS.UPLOADER}>
            <UploaderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="videos" replace />} />
        <Route path="videos" element={<UploaderVideoManagement />} />
        <Route path="youtube" element={<YouTubePlaylistManagement />} />
        <Route path="youtube-videos" element={<YouTubeVideoManagement />} />
        <Route path="unit-test" element={<UnitTestView />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={AUTH_ROUTES.HOME} replace />} />
    </Routes>
  );
}