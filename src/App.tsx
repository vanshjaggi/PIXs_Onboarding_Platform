import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginPage } from './components/LoginPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import { FirstLoginPage } from './components/FirstLoginPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { HRDashboard } from './components/HRDashboard';
import { RequestDetailPage } from './components/RequestDetailPage';
import { PendingRequestsPage } from './components/PendingRequestsPage';
import { SignedDocumentsPage } from './components/SignedDocumentsPage';
import { AllRequestsPage } from './components/AllRequestsPage';
import { CreateRequestPage } from './components/CreateRequestPage';
import { ManageUsersPage } from './components/ManageUsersPage';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (user.role === 'employee' && !user.hasCompletedFirstLogin) {
    return <Navigate to="/first-login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route 
        path="/first-login" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <FirstLoginPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/employee" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/employee/pending" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <PendingRequestsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/employee/documents" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <SignedDocumentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/hr" 
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/hr/requests" 
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <AllRequestsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/hr/create" 
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <CreateRequestPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/hr/users" 
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <ManageUsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/request/:id" 
        element={
          <ProtectedRoute>
            <RequestDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'hr' ? (
              <Navigate to="/dashboard/hr" replace />
            ) : (
              <Navigate to="/dashboard/employee" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}