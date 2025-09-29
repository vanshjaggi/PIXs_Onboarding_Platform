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
  CheckCircle, 
  Download, 
  Calendar, 
  Search,
  ArrowLeft,
  FileText,
  ExternalLink
} from 'lucide-react';

export function SignedDocumentsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load signed documents for the current user
  useEffect(() => {
    if (user) {
      loadSignedDocuments();
    }
  }, [user]);

  const loadSignedDocuments = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allRequests = await apiService.getSigningRequests(user.id);
      // Filter for signed requests only
      const signedRequests = allRequests.filter(request => request.status === 'signed');
      setRequests(signedRequests);
    } catch (error) {
      console.error('Error loading signed documents:', error);
      toast.error('Failed to load signed documents');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (document: any) => {
    // In a real app, this would handle the actual download
    toast.success(`Downloading ${document.name}...`);
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
              <h1 className="text-3xl font-semibold">Signed Documents</h1>
              <p className="text-muted-foreground mt-1">Loading your signed documents...</p>
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
            <h1 className="text-3xl font-semibold">Signed Documents</h1>
            <p className="text-muted-foreground mt-1">
              Your completed signature requests ({filteredRequests.length} of {requests.length} documents)
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search signed documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No signed documents</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No documents match your search criteria.' 
                    : 'You haven\'t signed any documents yet. Check your pending requests to get started.'}
                </p>
                {!searchTerm && (
                  <Button asChild className="mt-4">
                    <Link to="/dashboard/employee/pending">
                      View Pending Requests
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium">{request.title}</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Signed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Signed {request.signedAt ? new Date(request.signedAt).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {request.documents.length} document{request.documents.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Document List */}
                      {request.documents.length > 0 && (
                        <div className="ml-13 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Documents:</p>
                          <div className="space-y-2">
                            {request.documents.map((document) => (
                              <div key={document.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{document.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {(document.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(document)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/request/${request.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
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
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-900 mb-1">Your signed documents</p>
                  <p className="text-green-700">
                    All documents you've digitally signed are stored here. You can download copies anytime for your records. 
                    Keep these documents safe as they serve as legal proof of your agreements.
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