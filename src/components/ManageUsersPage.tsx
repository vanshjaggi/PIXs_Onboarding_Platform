import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DashboardLayout } from './DashboardLayout';
import { toast } from 'sonner@2.0.3';
import { apiService, User } from './api/ApiService';
import { 
  Users, 
  Plus, 
  Search,
  ArrowLeft,
  Mail,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  Phone
} from 'lucide-react';

export function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserTypeColor = (role: string) => {
    switch (role) {
      case 'hr':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === 'hr') {
      toast.error('Cannot delete HR admin users');
      return;
    }
    
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleCreateUser = async (userData: { name: string; email: string; role: string }) => {
    try {
      const newUser = await apiService.createUser({
        ...userData,
        role: userData.role as 'employee' | 'hr',
        hasCompletedFirstLogin: false,
      });
      setUsers([...users, newUser]);
      toast.success(`User ${userData.name} created successfully! Login credentials sent via email.`);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.hasCompletedFirstLogin).length,
    hr: users.filter(u => u.role === 'hr').length,
    employees: users.filter(u => u.role === 'employee').length
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/hr">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">Manage Users</h1>
              <p className="text-muted-foreground mt-1">Loading users...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-16 bg-muted animate-pulse rounded"></div>
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
            <Link to="/dashboard/hr">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">Manage Users</h1>
            <p className="text-muted-foreground mt-1">
              Add and manage employee accounts ({filteredUsers.length} of {users.length} users)
            </p>
          </div>
          <AddUserDialog 
            isOpen={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen}
            onCreateUser={handleCreateUser}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-xl font-semibold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">HR Admins</p>
                  <p className="text-xl font-semibold">{stats.hr}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-xl font-semibold">{stats.employees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users match your search criteria.' : 'No users have been added yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{user.name || 'Unnamed User'}</h3>
                          <Badge className={getUserTypeColor(user.role)}>
                            {user.role === 'hr' ? 'HR Admin' : 'Employee'}
                          </Badge>
                          <Badge className={user.hasCompletedFirstLogin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {user.hasCompletedFirstLogin ? 'Active' : 'Pending Setup'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </span>
                          )}
                          {user.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.role !== 'hr' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function AddUserDialog({ 
  isOpen, 
  onOpenChange,
  onCreateUser 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  onCreateUser: (userData: { name: string; email: string; role: string }) => void;
}) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'employee'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onCreateUser(userData);
      setUserData({ name: '', email: '', role: 'employee' });
    } catch (error) {
      console.error('Error in dialog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new employee account. Login credentials will be sent via email.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Full Name *</Label>
            <Input
              id="user-name"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address *</Label>
            <Input
              id="user-email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role *</Label>
            <Select
              value={userData.role}
              onValueChange={(value) => setUserData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="hr">HR Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}