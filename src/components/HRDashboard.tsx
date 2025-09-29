import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { 
  Plus, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Mock data for stats
const mockStats = {
  totalRequests: 156,
  pendingRequests: 12,
  completedRequests: 144,
  totalUsers: 48
};

export function HRDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {user?.name || 'HR Admin'}</h1>
          <p className="text-muted-foreground mt-2">
            Manage eSign requests and employee documents from your dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-semibold">{mockStats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold">{mockStats.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-semibold">{mockStats.completedRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link to="/dashboard/hr/requests">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    All Requests
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  View and manage all eSign requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mockStats.totalRequests} total requests
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    Manage
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link to="/dashboard/hr/create">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    Create Request
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Send new documents for signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    For existing or new users
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    Create
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link to="/dashboard/hr/users">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Manage Users
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Add and manage employee accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mockStats.totalUsers} active users
                  </span>
                  <span className="text-sm text-purple-600 font-medium">
                    Manage
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>


      </div>
    </DashboardLayout>
  );
}