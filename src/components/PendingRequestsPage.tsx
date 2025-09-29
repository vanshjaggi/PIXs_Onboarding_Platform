import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { DashboardLayout } from './DashboardLayout';
import { toast } from 'sonner@2.0.3';
import { apiService } from './api/ApiService';
import type { SigningRequest } from './api/ApiService';
import { useAuth } from './AuthContext';
import { 
  Clock, 
  Eye, 
  Calendar, 
  Search,
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';

export function PendingRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load pending requests for the current user
  useEffect(() => {
    if (user) {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allRequests = await apiService.getSigningRequests(user.id);
      // Filter for pending requests only
      const pendingRequests = allRequests.filter(request => request.status === 'pending');
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/employee">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">Pending Requests</h1>
              <p className="text-muted-foreground mt-1">Loading your pending signature requests...</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/employee">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">Pending Requests</h1>
            <p className="text-muted-foreground mt-1">
              Documents waiting for your signature ({filteredRequests.length} of {requests.length} requests)
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pending requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No requests match your search criteria.' 
                    : 'All caught up! You have no pending signature requests at the moment.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium">{request.title}</h3>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                            {isExpiringSoon(request.expiresAt) && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Expires {new Date(request.expiresAt).toLocaleDateString()}
                            </span>
                            <span>{request.documents.length} document{request.documents.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/request/${request.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review & Sign
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Text */}
        {requests.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <FileText className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Need help with signing?</p>
                  <p className="text-blue-700">
                    Click "Review & Sign" to view document details and complete the digital signature process. 
                    Make sure to review all documents carefully before signing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}