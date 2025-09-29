import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DashboardLayout } from './DashboardLayout';
import { toast } from 'sonner@2.0.3';
import { apiService } from './api/ApiService';
import type { User } from './api/ApiService';
import { 
  Plus, 
  Users, 
  Upload,
  ArrowLeft,
  FileText,
  User as UserIcon,
  X
} from 'lucide-react';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [selectedUser, setSelectedUser] = useState('');
  const [newUserData, setNewUserData] = useState({ 
    name: '', 
    email: '', 
    role: 'employee' 
  });
  const [documentTitle, setDocumentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const usersData = await apiService.getUsers();
      // Filter out HR users from recipient options
      setUsers(usersData.filter(user => user.role === 'employee'));
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }



    if (userType === 'existing' && !selectedUser) {
      toast.error('Please select an employee');
      return;
    }

    if (userType === 'new' && (!newUserData.name || !newUserData.email)) {
      toast.error('Please fill in all required fields for the new user');
      return;
    }

    setIsSubmitting(true);

    try {
      let employeeId = selectedUser;
      let employeeName = '';

      // If creating a new user, create them first
      if (userType === 'new') {
        const newUser = await apiService.createUser({
          name: newUserData.name,
          email: newUserData.email,
          role: newUserData.role as 'employee' | 'hr',
          hasCompletedFirstLogin: false,
        });
        employeeId = newUser.id;
        employeeName = newUser.name;
      } else {
        const existingUser = users.find(u => u.id === selectedUser);
        employeeName = existingUser?.name || '';
      }

      // Create the signing request
      await apiService.createSigningRequest({
        title: documentTitle,
        description: description,
        employeeId: employeeId,
        documents: documents,
      });

      if (userType === 'new') {
        toast.success(`New user ${newUserData.name} created and request sent!`);
      } else {
        toast.success(`Request sent to ${employeeName}!`);
      }
      
      navigate('/dashboard/hr/requests');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUserType('existing');
    setSelectedUser('');
    setNewUserData({ name: '', email: '', role: 'employee' });
    setDocumentTitle('');
    setDescription('');
    setDocuments([]);

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };



  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/hr">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Create eSign Request</h1>
            <p className="text-muted-foreground mt-1">
              Send a document for digital signature to an employee
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipient
              </CardTitle>
              <CardDescription>
                Choose whether to send to an existing employee or create a new user account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={userType === 'existing' ? 'default' : 'outline'}
                  onClick={() => setUserType('existing')}
                  className="justify-start h-auto py-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      Existing Employee
                    </div>
                    <p className="text-xs opacity-70">Send to current team member</p>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={userType === 'new' ? 'default' : 'outline'}
                  onClick={() => setUserType('new')}
                  className="justify-start h-auto py-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="h-4 w-4" />
                      New Employee
                    </div>
                    <p className="text-xs opacity-70">Create account and send</p>
                  </div>
                </Button>
              </div>

              {userType === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="user-select">Select Employee *</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : users.length === 0 ? (
                        <SelectItem value="no-users" disabled>No employees found</SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              <span>{user.name}</span>
                              <span className="text-muted-foreground">({user.email})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-name">Employee Name *</Label>
                    <Input
                      id="new-user-name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">Employee Email *</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="new-user-role">Role *</Label>
                    <Select 
                      value={newUserData.role} 
                      onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="hr">HR Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
              <CardDescription>
                Provide information about the document to be signed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-title">Document Title *</Label>
                <Input
                  id="document-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g. Employment Contract, NDA Agreement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional instructions or context for the signee..."
                  rows={3}
                />
              </div>



              <div className="space-y-2">
                <Label htmlFor="document-upload">Upload Documents *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-primary font-medium">Click to upload documents</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX • Maximum 25MB per file
                      </p>
                    </div>
                  </label>
                </div>

                {/* Show uploaded files */}
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Documents ({documents.length})</Label>
                    <div className="space-y-2">
                      {documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <p>The recipient will receive an email notification with signing instructions.</p>
                  {userType === 'new' && (
                    <p className="mt-1">New users will also receive login credentials via email.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                    Reset Form
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Request...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}