import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from './AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { 
  Clock, 
  CheckCircle, 
  FileText, 
  ArrowRight
} from 'lucide-react';

// Mock data for stats
const mockStats = {
  pendingRequests: 3,
  signedDocuments: 8,
  totalRequests: 11
};

export function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {user?.name || 'Employee'}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your documents and eSign requests from your dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
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
                  <p className="text-sm text-muted-foreground">Signed Documents</p>
                  <p className="text-2xl font-semibold">{mockStats.signedDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link to="/dashboard/employee/pending">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending eSign
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  View and complete pending signature requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mockStats.pendingRequests} document{mockStats.pendingRequests !== 1 ? 's' : ''} awaiting signature
                  </span>
                  <span className="text-sm text-yellow-600 font-medium">
                    View All
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link to="/dashboard/employee/documents">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Signed Documents
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Download and manage your signed documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mockStats.signedDocuments} completed document{mockStats.signedDocuments !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    View All
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