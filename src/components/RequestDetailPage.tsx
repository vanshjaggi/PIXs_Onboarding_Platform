import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DashboardLayout } from './DashboardLayout';
import { toast } from 'sonner@2.0.3';
import { apiService } from './api/ApiService';
import type { SigningRequest } from './api/ApiService';
import { useAuth } from './AuthContext';
import { 
  FileText, 
  Calendar, 
  User, 
  PenTool, 
  ArrowLeft, 
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail
} from 'lucide-react';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<SigningRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  const loadRequestDetail = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const requestData = await apiService.getSigningRequest(id);
      setRequest(requestData);
    } catch (error) {
      console.error('Error loading request details:', error);
      toast.error('Failed to load request details');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!request) return;
    
    setIsSigning(true);
    try {
      // In a real app, this would integrate with IDfy or similar eSign provider
      const updatedRequest = await apiService.signDocument(request.id);
      setRequest(updatedRequest);
      toast.success('Document signed successfully!');
      
      // Redirect based on user role
      if (user?.role === 'employee') {
        navigate('/dashboard/employee');
      } else {
        navigate('/dashboard/hr');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = (document: any) => {
    // In a real app, this would handle the actual download
    toast.success(`Downloading ${document.name}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'signed':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <div className="h-8 bg-muted animate-pulse rounded w-64 mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-48"></div>
            </div>
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Request not found</h3>
              <p className="text-muted-foreground mb-4">
                The signing request you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const expired = isExpired(request.expiresAt);
  const expiringSoon = isExpiringSoon(request.expiresAt);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{request.title}</h1>
            <p className="text-muted-foreground mt-1">
              Review and sign the requested document
            </p>
          </div>
        </div>

        {/* Alert for expiring/expired requests */}
        {expired && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">This request has expired</p>
                  <p className="text-sm text-red-700">
                    The deadline for signing this document was {new Date(request.expiresAt).toLocaleDateString()}.
                    Please contact the requester for assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {expiringSoon && request.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Expiring soon</p>
                  <p className="text-sm text-yellow-700">
                    This request expires on {new Date(request.expiresAt).toLocaleDateString()}. 
                    Please sign it as soon as possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request Information
              </CardTitle>
              <Badge className={getStatusColor(request.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(request.status)}
                  {request.status}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Requested by</p>
                  <p className="font-medium">{request.employeeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{request.employeeEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">{new Date(request.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {request.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{request.description}</p>
              </div>
            )}

            {request.signedAt && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-900">Signed</p>
                </div>
                <p className="text-sm text-green-700">
                  This document was signed on {new Date(request.signedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({request.documents.length})
            </CardTitle>
            <CardDescription>
              Review all documents before signing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {request.status === 'pending' ? (
                  <p>
                    Review all documents carefully before proceeding with the digital signature.
                    {expired && ' This request has expired and cannot be signed.'}
                  </p>
                ) : request.status === 'signed' ? (
                  <p>This document has been successfully signed and completed.</p>
                ) : (
                  <p>This request is no longer available for signing.</p>
                )}
              </div>
              <div className="flex gap-3">
                {request.status === 'pending' && !expired && (
                  <Button 
                    onClick={handleSign} 
                    disabled={isSigning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing...
                      </>
                    ) : (
                      <>
                        <PenTool className="h-4 w-4 mr-2" />
                        Sign Document
                      </>
                    )}
                  </Button>
                )}
                {request.status === 'signed' && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Signed Copy
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}